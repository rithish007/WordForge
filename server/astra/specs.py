from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
import math

Scalar = Annotated[float, Field(allow_inf_nan=False)]
Positive = Annotated[float, Field(gt=0, le=60, allow_inf_nan=False)]
Identifier = Annotated[str, Field(pattern=r"^[a-z][a-z0-9_]*$", max_length=80)]
ObjectType = Literal['rack','pallet','crate','barrier','pillar','charger','packing_station','door_frame']

class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')

class Bounds(StrictModel):
    width: Annotated[float, Field(ge=4, le=60, allow_inf_nan=False)]
    length: Annotated[float, Field(ge=4, le=60, allow_inf_nan=False)]
    height: Annotated[float, Field(ge=1, le=12, allow_inf_nan=False)] = 5

class GridSpec(StrictModel):
    resolution: Annotated[float, Field(ge=.05, le=.5, allow_inf_nan=False)] = .1

class WorldObject(StrictModel):
    id: Identifier
    label: str = Field(min_length=1, max_length=100)
    type: ObjectType
    category: str | None = Field(default=None, max_length=40)
    center: tuple[Scalar, Scalar]
    footprint: tuple[Positive, Positive]
    height: Positive
    yaw_deg: Annotated[float, Field(ge=-3600, le=3600, allow_inf_nan=False)] = 0
    blocking: bool = True

    @field_validator('category', mode='before')
    @classmethod
    def normalize_category(cls, value):
        if isinstance(value, str):
            return value.strip() or None
        return value

class Zone(StrictModel):
    id: Identifier
    label: str = Field(min_length=1, max_length=100)
    type: str = Field(min_length=1, max_length=40)
    center: tuple[Scalar, Scalar]
    extent: tuple[Positive, Positive]
    yaw_deg: Annotated[float, Field(ge=-3600, le=3600, allow_inf_nan=False)] = 0

class WorldSpec(StrictModel):
    schema_version: Literal[1] = 1
    id: Identifier
    name: str = Field(min_length=1, max_length=120)
    type: Literal['warehouse'] = 'warehouse'
    bounds: Bounds
    grid: GridSpec = Field(default_factory=GridSpec)
    zones: list[Zone] = Field(default_factory=list, max_length=40)
    objects: list[WorldObject] = Field(default_factory=list, max_length=400)
    assumptions: list[Annotated[str, Field(max_length=500)]] = Field(default_factory=list, max_length=40)

    @model_validator(mode='after')
    def unique_ids(self):
        ids = [o.id for o in [*self.objects, *self.zones]]
        if len(ids) != len(set(ids)):
            raise ValueError('Object and zone IDs must be unique and stable.')
        return self

class RobotSpec(StrictModel):
    schema_version: Literal[1] = 1
    id: Identifier
    name: str
    manufacturer: str
    drive: Literal['differential'] = 'differential'
    footprint: tuple[Positive, Positive]
    height: Positive
    mass: float
    max_linear_velocity: float
    max_angular_velocity: float
    collision_radius: float
    safety_margin: float = .05
    source: str
    datasheet_url: str
    estimated_parameters: list[str] = Field(default_factory=list)
    variant: str
    parameter_sources: dict[str,str] = Field(default_factory=dict)

def robot_spec(id, name, manufacturer, footprint, height, mass, speed, url, variant):
    return RobotSpec(id=id, name=name, manufacturer=manufacturer, footprint=footprint,
        height=height, mass=mass, max_linear_velocity=speed, max_angular_velocity=1.0,
        collision_radius=math.hypot(*footprint)/2, source='estimated',
        datasheet_url=url, variant=variant, estimated_parameters=['max_angular_velocity'],
        parameter_sources={'footprint':'manufacturer','height':'manufacturer','mass':'manufacturer',
            'max_linear_velocity':'manufacturer','max_angular_velocity':'simulation estimate',
            'collision_radius':'computed half-diagonal','safety_margin':'simulation assumption'})

ROBOTS = {
    'boxer': robot_spec('boxer','Boxer','Clearpath',(.740,.550),.320,114,2.0,
        'https://docs.clearpathrobotics.com/docs_robots/legacy/ros1_robots/indoor_robots/boxer/user_manual_boxer/#system-specifications',
        'Boxer 2.4; turn rate is a simulation estimate'),
    'rb_theron': robot_spec('rb_theron','RB-THERON','Robotnik',(.717,.550),.320,70,1.25,
        'https://robotnik.eu/wp-content/uploads/2024/09/Robotnik_Datasheet_RB-THERON_EN_2024.pdf',
        '2024 base without lifting unit; turn rate is a simulation estimate'),
}

class MissionRequest(StrictModel):
    world: WorldSpec
    robot_id: str = 'rb_theron'
    start: tuple[Scalar, Scalar]
    goal: tuple[Scalar, Scalar]
    start_yaw_deg: Scalar = 0
    seed: int = Field(default=0, ge=0, le=2147483647)
    time_limit_s: float = Field(default=120, ge=1, le=120, allow_inf_nan=False)

class WorldReport(StrictModel):
    valid: bool
    navigable: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    free_area_fraction: float = 0
    largest_component_fraction: float = 0
    unreachable_zones: list[str] = Field(default_factory=list)
    robot_id: str
