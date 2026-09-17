import json
from concurrent.futures import ThreadPoolExecutor

import httpx
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from astra import ai
from astra.main import app
from astra.fixtures import WORLDS

KEY = 'sk-test-never-a-real-credential-123456'
ORIGIN = {'origin': 'http://127.0.0.1:3000'}


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(ai, 'LEDGER_PATH', tmp_path / 'spend.json')
    ai.SESSIONS.clear()
    def forbidden(*args):
        raise AssertionError('Tests must never call the real provider')
    monkeypatch.setattr(ai, 'provider', forbidden)
    with TestClient(app, headers=ORIGIN) as client:
        yield client
    ai.SESSIONS.clear()


def connect(client, limit=5):
    return client.post('/api/ai/connect', json={'api_key': KEY, 'daily_limit_usd': limit})


def proposal(world=None):
    return {'status': 'completed', 'usage': {'input_tokens': 1000, 'output_tokens': 1000},
            'output': [{'type': 'function_call', 'name': 'propose_world',
                        'arguments': json.dumps({'world': world or WORLDS['crossdock'].model_dump(),
                                                 'summary': 'Warehouse proposal.'})}]}


def test_secret_validation_cookie_and_disconnect(client):
    bad = client.post('/api/ai/connect', json={'api_key': KEY, 'daily_limit_usd': -1})
    assert bad.status_code == 422 and KEY not in bad.text
    assert client.post('/api/ai/connect', headers={'origin': 'https://evil.example'},
                       json={'api_key': KEY, 'daily_limit_usd': 5}).status_code == 403
    response = connect(client)
    assert response.status_code == 200 and KEY not in response.text
    cookie = response.headers['set-cookie']
    assert 'HttpOnly' in cookie and 'SameSite=strict' in cookie and 'Path=/api/ai' in cookie
    assert client.get('/api/ai/session').json()['connected']
    client.post('/api/ai/disconnect', json={})
    assert not client.get('/api/ai/session').json()['connected']
    assert client.post('/api/ai/build', json={'prompt': 'warehouse'}).status_code == 401


def test_valid_typed_proposal_and_accounting(client, monkeypatch):
    connect(client)
    def provider(key, payload):
        assert key == KEY
        assert payload['store'] is False and payload['model'] == 'gpt-6-astra'
        assert payload['tool_choice']['name'] == 'propose_world'
        assert payload['parallel_tool_calls'] is False
        schema = payload['tools'][0]['parameters']
        assert schema['additionalProperties'] is False
        assert 'prefixItems' not in json.dumps(schema)
        assert 'default' not in json.dumps(schema)
        return proposal()
    monkeypatch.setattr(ai, 'provider', provider)
    response = client.post('/api/ai/build', json={'prompt': 'Build a warehouse'})
    assert response.status_code == 200, response.text
    assert response.json()['report']['navigable']
    assert response.json()['world']['id'] == 'crossdock'
    status = client.get('/api/ai/session').json()
    assert status['used_usd'] == pytest.approx(.0625)
    assert KEY not in ai.LEDGER_PATH.read_text()


def test_timeout_reserved_across_reconnect_and_cap(client, monkeypatch):
    connect(client, 1.25)
    calls = []
    def timeout(*args):
        calls.append(1)
        raise httpx.ReadTimeout('upstream detail must not escape ' + KEY)
    monkeypatch.setattr(ai, 'provider', timeout)
    response = client.post('/api/ai/build', json={'prompt': 'warehouse'})
    assert response.status_code == 502 and KEY not in response.text
    client.post('/api/ai/disconnect', json={})
    connect(client, 1.25)
    assert client.post('/api/ai/build', json={'prompt': 'warehouse'}).status_code == 429
    assert len(calls) == 1
    assert client.get('/api/ai/session').json()['used_usd'] == ai.reserve_amount()
    assert client.get('/api/worlds').status_code == 200


@pytest.mark.parametrize('output', [None, [], {'status': 'incomplete'}, {'status': 'completed', 'output': [None]}])
def test_malformed_output_never_applied(client, monkeypatch, output):
    connect(client)
    monkeypatch.setattr(ai, 'provider', lambda *args: output)
    response = client.post('/api/ai/build', json={'prompt': 'warehouse'})
    assert response.status_code in (422, 502)
    assert 'world' not in response.json()


def test_invalid_geometry_rejected(client, monkeypatch):
    connect(client)
    world = WORLDS['crossdock'].model_dump()
    world['objects'][0]['center'] = [100, 100]
    monkeypatch.setattr(ai, 'provider', lambda *args: proposal(world))
    response = client.post('/api/ai/build', json={'prompt': 'warehouse'})
    assert response.status_code == 422
    assert 'invalid geometry' in response.text
    assert WORLDS['crossdock'].objects[0].center != (100, 100)


def test_atomic_parallel_reservations_and_restart(client):
    def reserve(_):
        try:
            ai.reserve(KEY, 1.25)
            return True
        except HTTPException as error:
            assert error.status_code == 429
            return False
    with ThreadPoolExecutor(max_workers=8) as executor:
        assert sum(executor.map(reserve, range(16))) == 1
    ai.SESSIONS.clear()
    with pytest.raises(HTTPException):
        ai.reserve(KEY, 1.25)


def test_no_owner_key_fallback_session_isolation_and_expiry(client, monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'sk-owner-must-never-be-used')
    assert client.post('/api/ai/build', json={'prompt': 'warehouse'}).status_code == 401
    connect(client)
    with TestClient(app, headers=ORIGIN) as other:
        assert not other.get('/api/ai/session').json()['connected']
    for session in ai.SESSIONS.values():
        session['expires'] = 0
    assert not client.get('/api/ai/session').json()['connected']
    assert not ai.SESSIONS


def test_busy_and_unknown_pricing_fail_before_provider(client, monkeypatch):
    connect(client)
    session = next(iter(ai.SESSIONS.values()))
    session['lock'].acquire()
    try:
        assert client.post('/api/ai/build', json={'prompt': 'warehouse'}).status_code == 409
    finally:
        session['lock'].release()
    monkeypatch.setattr(ai, 'MODEL', 'unpriced-model')
    assert client.post('/api/ai/build', json={'prompt': 'warehouse'}).status_code == 503
