// This source file builds the 3D model of ingredients and recipies

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Create a parent object representing the recipe graph so that we can rotate it within the scene
const recipeGraph = frag.SceneObject(engine);
scene.addObject(recipeGraph);

// Define a shared ingredient elements
const ingredientShader = frag.Shader(engine).diffuseTexture().directionalLightGrey().compile().lightDirection(lightDirection);

let ingredientMesh;
switch (ingredientShape) {
  case 'disc':
    ingredientMesh = frag.Disc(engine, 16);
    break;
  case 'hemisphere':
    ingredientMesh = frag.Sphere(engine, 16, {
      longitudeFacets: 16,
      longitudeStart: Math.PI * 0.5,
      longitudeLength: Math.PI,
      longitudeTextureStart: Math.PI * 0.7,
      longitudeTextureEnd: Math.PI * 1.5,
      latitudeTextureStart: Math.PI * 0.1,
      latitudeTextureEnd: Math.PI * 0.9,
    })
    break;
  case 'sphere':
    ingredientMesh = frag.Sphere(engine, 16, {
      latitudeTextureStart: Math.PI * 0.2,
      latitudeTextureEnd: Math.PI * 0.8,
      longitudeTextureRepeat: 3,
    })
    break;
}

// Augment each ingredient with additional information needed to animate it
for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];

  ingredient.position = [
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
  ];
  ingredient.velocity = [0, 0, 0];

  let diffuseTexture
  if (ingredient.textureUrl)
    diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGBA).fromUrl(0, ingredient.textureUrl, '');
  else if (ingredient.color) {
    if (ingredient.color.length == 4)
      diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGBA).fromArrayBuffer(0, new Uint8Array(frag.Vector.mult(ingredient.color, 255)), 0, 1, 1);
    else
      diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGB).fromArrayBuffer(0, new Uint8Array(frag.Vector.mult(ingredient.color, 255)), 0, 1, 1);
  }
  else 
    diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGB).fromArrayBuffer(0, new Uint8Array([randomInt(100, 255), randomInt(100, 255), randomInt(100, 255)]), 0, 1, 1);

  const material = frag.Material(engine)
    .setTexture('diffuse', diffuseTexture);

  ingredient.sceneObject = frag.SceneObject(engine, 
    frag.Model(engine)
      .mesh(ingredientMesh)
      .material(material)
      .shader(ingredientShader)
  );

  ingredient.sceneObject.getPosition()
    .scale(ingredientRadius)
    .location(ingredient.position);

  switch (ingredientShape) {
    case 'sphere':
    case 'hemisphere':
      ingredient.sceneObject.getPosition().rotateY(Math.PI * -0.5)
  }
  recipeGraph.addObject(ingredient.sceneObject);
}

// Define a shared recipe elements

const recipeShader = frag.Shader(engine).colorsRGB().directionalLightGrey().compile().lightDirection(lightDirection);
const recipeModel = frag.Model(engine).mesh(frag.Sphere(engine, 8, { color: [1, 1, 1] }).shadeSmooth()).shader(recipeShader);

// Augment each recipe with with additional information needed to animate it

for (let i = 0; i < recipies.length; i++) {
  const recipe = recipies[i];
  recipe.position = [0, 0, 0];
  recipe.sceneObject = frag.SceneObject(engine, recipeModel);

  recipe.sceneObject.getPosition()
    .scale(recipeRadius)
    .location(recipe.position);

  recipeGraph.addObject(recipe.sceneObject);
}

// Define shared pipe elements

const pipeShader = frag.Shader(engine).colorsRGB().directionalLightGrey().compile().lightDirection(lightDirection);
const inputPipeMesh = frag.Cylinder(engine, 8, { color: [0.3, 0.3, 1] }).shadeSmooth();
const outputPipeMesh = frag.Cylinder(engine, 8, { color: [1, 0.3, 0.3] }).shadeSmooth();

// Add pipes to recipe inputs and outputs to connect to the ingredients
for (let i = 0; i < recipies.length; i++) {
  const recipe = recipies[i];

  recipe.pipes = [{
    ingredient: recipe.output.ingredient,
    mesh: outputPipeMesh,
  }];

  for (let j = 0; j < recipe.inputs.length; j++) {
    recipe.pipes.push({
      ingredient: recipe.inputs[j].ingredient,
      mesh: inputPipeMesh,
    });
  }

  for (let j = 0; j < recipe.pipes.length; j++) {
    const pipe = recipe.pipes[j];
    pipe.sceneObject = frag.SceneObject(engine, frag.Model(engine).mesh(pipe.mesh).shader(pipeShader).shadeSmooth());
    pipe.sceneObject.getPosition().scaleXYZ(pipeRadius, pipeRadius, 1);
    recipeGraph.addObject(pipe.sceneObject);
  }
}
