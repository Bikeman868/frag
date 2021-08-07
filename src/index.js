require('./Math/Vector');
require('./Math/Triangle');
require('./Math/Matrix');
require('./Math/Quaternion')

require('./Framework/Observable');
require('./Framework/ObservableValue');
require('./Framework/Transform');
require('./Framework/Transform2D');
require('./Framework/Transform3D');
require('./Framework/Location');
require('./Framework/Engine');

require('./Shaders/CustomShader');
require('./Shaders/Shader');
require('./Shaders/UiShader');
require('./Shaders/FontShader');
require('./Shaders/ParticleShader3D');
require('./Shaders/ParticleShader2D');

require('./Materials/Texture');
require('./Materials/Font');
require('./Materials/Material');

require('./SceneGraph/VertexData');
require('./SceneGraph/Mesh');
require('./SceneGraph/MeshOptimizer');
require('./SceneGraph/Model');
require('./SceneGraph/ScenePosition');
require('./SceneGraph/SceneObject');
require('./SceneGraph/Scene');
require('./SceneGraph/DrawContext');
require('./SceneGraph/PositionLink');

require('./Cameras/cameraMixin');
require('./Cameras/UiCamera');
require('./Cameras/OrthographicCamera');
require('./Cameras/PerspectiveCamera');
require('./Cameras/FrustumCamera');

require('./Animations/Animation');
require('./Animations/ObjectAnimationState');
require('./Animations/ModelAnimation');
require('./Animations/SceneObjectAnimation');
require('./Animations/ValueAnimationAction');
require('./Animations/KeyframeAnimationAction');
require('./Animations/ParallelAnimationAction');
require('./Animations/RepeatAnimationAction');
require('./Animations/PositionAnimationAction');

require('./Shapes/Cube');
require('./Shapes/Cylinder');
require('./Shapes/Disc');
require('./Shapes/Plane');
require('./Shapes/Sphere');

require('./Loaders/AssetCatalog');
require('./Loaders/PackageLoader');

require('./Input/InputMethod');
require('./Input/DigitalState');
require('./Input/AnalogState');
require('./Input/DigitalInput');
require('./Input/AnalogInput');
require('./Input/DigitalAction');
require('./Input/AnalogAction');

require('./Particles/CustomParticleSystem');
require('./Particles/CustomParticleEmitter');
require('./Particles/MineExplosionEmitter');
require('./Particles/SphericalExplosionEmitter');
require('./Particles/SprayEmitter');
require('./Particles/RainEmitter');

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('./Shaders/ParticleShaderDebug');
}
