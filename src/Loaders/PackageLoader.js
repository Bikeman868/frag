window.frag.PackageLoader = function (engine) {
    if (engine.packageLoader) return engine.packageLoader;

    const frag = window.frag;

    const uInt32 = new Uint32Array([0x11223344]);
    const uInt8 = new Uint8Array(uInt32.buffer);
    const littleEndian = uInt8[0] === 0x44;

    const round4 = function(n) { return Math.round(n * 10000) / 10000; }

    const private = {
    }

    const public = {
        __private: private,
        littleEndian,
    };

    public.dispose = function () {
    }

    engine.packageLoader = public;

    private.loadFontV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const font = context.assetCatalog.getFont(name);
        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is font " + name);

        const faceLength = context.header.getUint8(headerOffset++);
        var fontFace = "";
        for (let i = 0; i < faceLength; i++) {
            fontFace += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const lineHeight = context.header.getUint16(headerOffset, littleEndian);
        const width = context.header.getUint16(headerOffset + 2, littleEndian);
        const height = context.header.getUint16(headerOffset + 4, littleEndian);
        const charCount = context.header.getUint16(headerOffset + 6, littleEndian);
        headerOffset += 8;

        if (engine.debugPackageLoader)
            console.log("  " + width + "x" + height + " pixel texture contains " + charCount + " characters from " + lineHeight + "px " + fontFace);

        font.lineHeight(lineHeight);

        for (let charIndex = 0; charIndex < charCount; charIndex++) {
            const charLength = context.header.getUint8(headerOffset++);
            var char = "";
            for (let i = 0; i < charLength; i++) {
                char += String.fromCharCode(context.header.getUint8(headerOffset++));
            }
            const x = context.header.getUint16(headerOffset + 0, littleEndian);
            const y = context.header.getUint16(headerOffset + 2, littleEndian);
            const width = context.header.getUint16(headerOffset + 4, littleEndian);
            const height = context.header.getUint16(headerOffset + 6, littleEndian);
            const originX = context.header.getInt16(headerOffset + 8, littleEndian);
            const originY = context.header.getInt16(headerOffset + 10, littleEndian);
            const advance = context.header.getInt16(headerOffset + 12, littleEndian);
            headerOffset += 14;

            font.addChar(char, x, y, width, height, originX, originY, advance);
        }

        const modeLength = context.header.getUint8(headerOffset++);
        var mode = "";
        for (let i = 0; i < modeLength; i++) {
            mode += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        if (mode === "RGB") font.dataFormat(engine.gl.RGB);
        else if (mode === "RGBA") font.dataFormat(engine.gl.RGBA);
        else if (mode === "L") font.dataFormat(engine.gl.LUMINANCE);
        else console.error("Font " + name + " unsupported mode " + mode);

        const imageWidth = context.header.getUint16(headerOffset + 0, littleEndian);
        const imageHeight = context.header.getUint16(headerOffset + 2, littleEndian);
        let dataOffset = context.header.getUint32(headerOffset + 4, littleEndian) + context.dataOffset;
        headerOffset += 8;

        if (imageWidth !== width)             
            console.error("Font " + name + " width does not match image width");
        if (imageHeight !== height)             
            console.error("Font " + name + " height does not match image height");

        const dataArray = new Uint8Array(context.data, dataOffset);
        font.fromArrayBuffer(dataArray, 0, width, height);
        return font;
    }

    private.loadMaterialV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }
        const material = context.assetCatalog.getMaterial(name);
        const textureCount = context.header.getUint8(headerOffset++)

        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is " + name + " material with " + textureCount + " textures");
            
        for (let i = 0; i < textureCount; i++) {
            const textureTypeLength = context.header.getUint8(headerOffset++);
            var textureType = "";
            for (let i = 0; i < textureTypeLength; i++) {
                textureType += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            const modeLength = context.header.getUint8(headerOffset++);
            var mode = "";
            for (let i = 0; i < modeLength; i++) {
                mode += String.fromCharCode(context.header.getUint8(headerOffset++));
            }
    
            const texture = frag.Texture(engine);
            if (mode === "RGB") texture.dataFormat(engine.gl.RGB);
            else if (mode === "RGBA") texture.dataFormat(engine.gl.RGBA);
            else if (mode === "L") texture.dataFormat(engine.gl.LUMINANCE);
            else console.error("Texture " + name + " unsupported mode " + mode);
    
            const imageWidth = context.header.getUint16(headerOffset + 0, littleEndian);
            const imageHeight = context.header.getUint16(headerOffset + 2, littleEndian);
            const dataOffset = context.header.getUint32(headerOffset + 4, littleEndian) + context.dataOffset;
            headerOffset += 8;
    
            if (engine.debugPackageLoader)
                console.log("  Texture " + textureType + " is " + imageWidth + "x"  + imageHeight + "px in " + mode + " format");

            const dataArray = new Uint8Array(context.data, dataOffset);
            texture.fromArrayBuffer(0, dataArray, dataOffset, imageWidth, imageHeight);
            material.setTexture(textureType, texture);
        }
        return material;
    }

    private.loadMeshV1 = function (context, objectIndex, headerOffset) {
        const mesh = frag.MeshData(engine);
        const fragmentCount = context.header.getUint16(headerOffset, littleEndian);
        headerOffset += 2;
        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is a mesh with " + fragmentCount + " fragments");

        for (let fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex++) {
            const vertexFormat = context.header.getUint8(headerOffset);
            const dataFlags = context.header.getUint8(headerOffset + 1);
            const normalFormat = context.header.getUint8(headerOffset + 2);
            const tangentFormat = context.header.getUint8(headerOffset + 3);
            const bitangentFormat = context.header.getUint8(headerOffset + 4);
            const uvFormat = context.header.getUint8(headerOffset + 5);
            const colorFormat = context.header.getUint8(headerOffset + 6);
            const meshVertexCount = context.header.getUint32(headerOffset + 7, littleEndian);
            const indexVertexCount = context.header.getUint32(headerOffset + 11, littleEndian);
            let dataOffset = context.header.getUint32(headerOffset + 15, littleEndian) + context.dataOffset;
            headerOffset += 19;

            const isIndexed = (dataFlags & 0x01) === 0x01;
            const is3D = (dataFlags & 0x02) === 0x02;

            let triangleCount = 0;
            if (vertexFormat === 1) {
                triangleCount = meshVertexCount / 3;
            }
            else if (vertexFormat === 2) {
                triangleCount = meshVertexCount / 2;
            }
            else if (vertexFormat === 3) {
                triangleCount = meshVertexCount - 2;
            }
            else if (vertexFormat === 4) {
                triangleCount = meshVertexCount - 2;
            };

            if (engine.debugPackageLoader) {
                let msg = "  fragment[" + fragmentIndex + "] has " + meshVertexCount + " verticies forming ";
                if (vertexFormat === 1) {
                    msg += triangleCount + " triangles"
                }
                else if (vertexFormat === 2) {
                    msg += (triangleCount / 2) + " rectangles"
                }
                else if (vertexFormat === 3) {
                    msg += "a strip of " + triangleCount + "triangles"
                }
                else if (vertexFormat === 4) {
                    msg += "a fan of " + triangleCount + " triangles"
                };

                if (isIndexed) msg += " indexed";
                if (!is3D) msg += " in 2D";

                switch (normalFormat) {
                    case 1:
                        msg += " with custom normals";
                        break;
                    case 2:
                        msg += " with indexed normals";
                        break;
                    case 3:
                        msg += " with triangle normals";
                        break;
                }

                switch (tangentFormat) {
                    case 1:
                        msg += " with custom tangents";
                        break;
                    case 2:
                        msg += " with indexed tangents";
                        break;
                    case 3:
                        msg += " with triangle tangents";
                        break;
                    case 4:
                        msg += " with single tangent";
                        break;
                }

                switch (bitangentFormat) {
                    case 1:
                        msg += " with bitangents";
                        break;
                }

                switch (uvFormat) {
                    case 1:
                        msg += " with custom uvs";
                        break;
                    case 2:
                        msg += " with indexed uvs";
                        break;
                    case 3:
                        msg += " with triangle uvs";
                        break;
                }

                switch (colorFormat) {
                    case 1:
                        msg += " with custom colors";
                        break;
                    case 2:
                        msg += " with custom colors and transparency";
                        break;
                    case 3:
                        msg += " with indexed colors";
                        break;
                    case 4:
                        msg += " with indexed colors and transparency";
                        break;
                }

                console.log(msg);
            }

            const index = isIndexed ? [] : undefined;
            if (isIndexed) {
                indexArray = new Int16Array(context.data, dataOffset);
                for (let i = 0; i < meshVertexCount; i++) {
                    index.push(indexArray[i]);
                }
                dataOffset += 2 * meshVertexCount;
                if ((meshVertexCount & 1) == 1) dataOffset += 2;
            }

            const verticies = [];
            const normals = normalFormat === 0 ? undefined : [];
            const tangents = tangentFormat === 0 ? undefined : [];
            const bitangents = bitangentFormat === 0 ? undefined : [];
            const uvs = uvFormat === 0 ? undefined : [];
            const colors = undefined;

            const dataArray = new Float32Array(context.data, dataOffset);

            for (let vertexOffset = 0; vertexOffset < meshVertexCount; vertexOffset++) {
                let indexOffset = isIndexed ? index[vertexOffset] : vertexOffset;

                let triangleOffset = Math.trunc(vertexOffset / 3);
                if (vertexFormat === 2) {
                    triangleOffset = Math.trunc(vertexOffset / 4);
                }
                else if (vertexFormat === 3 || vertexFormat === 4) {
                    if (vertexOffset < 3) triangleOffset = 0;
                    else triangleOffset = vertexOffset - 2;
                }

                let sectionDataIndex = 0;
                let vertexDataIndex = is3D ? indexOffset * 3 : indexOffset * 2;

                verticies.push(dataArray[vertexDataIndex]); // X
                verticies.push(dataArray[vertexDataIndex + 1]); // Y
                if (is3D) {
                    verticies.push(dataArray[vertexDataIndex + 2]); // Z
                    sectionDataIndex += indexVertexCount * 3;
                } else {
                    sectionDataIndex += indexVertexCount * 2;
                }

                switch (normalFormat) {
                    case 1:
                        vertexDataIndex = sectionDataIndex + vertexOffset * 3;
                        sectionDataIndex += meshVertexCount * 3;
                        break;
                    case 2:
                        vertexDataIndex = sectionDataIndex + indexOffset * 3;
                        sectionDataIndex += indexVertexCount * 3;
                        break;
                    case 3:
                        vertexDataIndex = sectionDataIndex + triangleOffset * 3;
                        sectionDataIndex += triangleCount * 3;
                        break;
                }
                if (normalFormat !== 0) {
                    normals.push(dataArray[vertexDataIndex]); // X
                    normals.push(dataArray[vertexDataIndex + 1]); // Y
                    normals.push(dataArray[vertexDataIndex + 2]); // Z
                }

                //if (hasTangents) {
                //    tangents.push(dataArray[vertexDataIndex]); // X
                //    tangents.push(dataArray[vertexDataIndex + 1]); // Y
                //    tangents.push(dataArray[vertexDataIndex + 2]); // Z
                //    vertexDataIndex += indexVertexCount * 3;
                //}

                //if (hasBitangents) {
                //    bitangents.push(dataArray[vertexDataIndex]); // X
                //    bitangents.push(dataArray[vertexDataIndex + 1]); // Y
                //    bitangents.push(dataArray[vertexDataIndex + 2]); // Z
                //    vertexDataIndex += indexVertexCount * 3;
                //}

                //if (hasUvs) {
                //    uvs.push(dataArray[vertexDataIndex]); // U
                //    uvs.push(dataArray[vertexDataIndex + 1]); // V
                //    vertexDataIndex += indexVertexCount * 2;
                //}
            }

            if (engine.debugPackageLoader && engine.debugMeshes) {
                let msg = "  vertices[";
                for (var i = 0; i < verticies.length; i++) {
                    if (i > 0) msg += ', ';
                    msg += round4(verticies[i]);
                }
                msg += "]";
                console.log(msg);
            }

            const vertexData = frag.VertexData(engine);
            if (vertexFormat === 1 || vertexFormat === 2) {
                if (is3D)
                    vertexData.setTriangles(verticies, colors, uvs, normals, tangents, bitangents)
                else
                    vertexData.setTriangles2D(verticies, colors, uvs, normals, tangents, bitangents);
            }
            else if (vertexFormat === 3) vertexData.setTriangleStrip(verticies, colors, uvs, normals, tangents, bitangents);
            else if (vertexFormat === 4) vertexData.setTriangleFan(verticies, colors, uvs, normals, tangents, bitangents);

            mesh.addVertexData(vertexData);
        }

        return mesh;
    }

    private.loadAnimationV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const flags = context.header.getUint8(headerOffset);
        const frames = context.header.getUint16(headerOffset + 1, littleEndian);
        const interval = context.header.getUint16(headerOffset + 3, littleEndian);
        const channelCount = context.header.getUint8(headerOffset + 5);
        headerOffset += 6;

        const loop = (flags & 0x1) === 0x1;
        const reverse = (flags & 0x2) === 0x2;

        if (engine.debugPackageLoader) {
            let msg = "Object[" + objectIndex + "] is '" + name + "' animation which runs for " + frames + "x" + interval + " ms";
            if (loop) msg += ". Repeats until stopped";
            if (reverse) msg += ". Plays in reverse after playing forwards";
            console.log(msg);
        }

        const modelAnimation = frag.ModelAnimation(engine)
            .name(name)
            .loop(loop)
            .frames(frames)
            .interval(interval / engine.gameTickMs);

        for (let i = 0; i < channelCount; i++) {
            const patternLength = context.header.getUint8(headerOffset++);
            var pattern = "";
            for (let i = 0; i < patternLength; i++) {
                pattern += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            const channelNameLength = context.header.getUint8(headerOffset++);
            var channelName = "";
            for (let i = 0; i < channelNameLength; i++) {
                channelName += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            if (engine.debugPackageLoader && engine.debugAnimations) {
                msg = "  Channel " + channelName + " applies to " + pattern + " children"
                console.log(msg);
            }

            const keyframes = {};
            const keyframeCount = context.header.getUint16(headerOffset, littleEndian);
            headerOffset += 2;

            for (let j = 0; j < keyframeCount; j++) {
                const frame = context.header.getUint16(headerOffset, littleEndian);
                const transitionEnum = context.header.getUint8(headerOffset + 2);
                const value = context.header.getFloat32(headerOffset + 3, littleEndian);
                headerOffset += 7;

                var transition = "step";
                if (transitionEnum === 1) transition = "linear";
                else if (transitionEnum === 2) transition = "spline";
                keyframes[frame] = { value, transition };

                if (engine.debugPackageLoader && engine.debugAnimations) {
                    msg = "    Keyframe[" + frame + "] = " + round4(value) + " " + transition;
                    console.log(msg);
                }
            }

            modelAnimation.addChannel({
                channel: channelName,
                pattern: new RegExp(pattern, "i"),
                keyframes: keyframes
            });
        }

        return modelAnimation;
    }

    private.loadModelV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const modelFlags = context.header.getUint8(headerOffset);
        const materialIndex = context.header.getUint16(headerOffset + 1, littleEndian);
        const meshIndex = context.header.getUint16(headerOffset + 3, littleEndian);
        headerOffset += 5;

        const location = frag.Location(engine, true); // Loaded models are always 3D
        location.translateX = context.header.getFloat32(headerOffset + 0, littleEndian);
        location.translateY = context.header.getFloat32(headerOffset + 4, littleEndian);
        location.translateZ = context.header.getFloat32(headerOffset + 8, littleEndian);
        location.rotateX = context.header.getFloat32(headerOffset + 12, littleEndian);
        location.rotateY = context.header.getFloat32(headerOffset + 16, littleEndian);
        location.rotateZ = context.header.getFloat32(headerOffset + 20, littleEndian);
        location.scaleX = context.header.getFloat32(headerOffset + 24, littleEndian);
        location.scaleY = context.header.getFloat32(headerOffset + 28, littleEndian);
        location.scaleZ = context.header.getFloat32(headerOffset + 32, littleEndian);
        location.isModified = true;
        headerOffset += 36;

        const childCount = context.header.getUint16(headerOffset, littleEndian);
        const animationCount = context.header.getUint16(headerOffset + 2, littleEndian);
        headerOffset += 4;

        const isRoot = (modelFlags & 1) === 1;
        const hasMaterial = (modelFlags & 2) === 2;
        const hasMesh = (modelFlags & 4) === 4;

        if (engine.debugPackageLoader) {
            console.log("Object[" + objectIndex + "] is " + 
                (isRoot ? "root " : "") + "model " + name + " with " + childCount + " children and " + animationCount + " animations." + 
                (hasMesh ? " Paint mesh " + meshIndex : " No mesh") + (hasMaterial ? " with material " + materialIndex : ". No material"));
            console.log("Object[" + objectIndex + "] at (" + 
                round4(location.translateX) + "," + round4(location.translateY) + "," + round4(location.translateZ) +").["+ 
                round4(location.rotateX) + "," + round4(location.rotateY) + "," + round4(location.rotateZ) + "]x(" + 
                round4(location.scaleX) + "," + round4(location.scaleY) + "," + round4(location.scaleZ) + ")");
        }

        const model = context.assetCatalog.getModel(name, !isRoot);
        model.location = location;

        if (hasMaterial) model.material(context.materials[materialIndex]);
        if (hasMesh) model.mesh(context.meshes[meshIndex]);

        for (let i = 0; i < childCount; i++) {
            const modelIndex = context.header.getUint16(headerOffset, littleEndian);
            headerOffset += 2;
            model.addChild(context.models[modelIndex]);
        }

        if (isRoot) {
            if (engine.debugAnimations && animationCount > 0)
                console.log("Model #" + objectIndex + " '" + name + "' has " + animationCount + " animations");
            for (let i = 0; i < animationCount; i++) {
                const animationIndex = context.header.getUint16(headerOffset, littleEndian);
                headerOffset += 2;

                const animation = context.animations[animationIndex];
                if (engine.debugAnimations) {
                    const channels = animation.getChannelGraphs();
                    console.log("  Animation '" + animation.getName() + "' has " + channels.length + " channels." + (animation.__private.loop ? " Loop " : "") + animation.__private.frames + "x" + animation.__private.interval + " frames");
                    for (let channelIndex = 0; channelIndex < channels.length; channelIndex++) {
                        console.log("    Animates " + channels[channelIndex].channel + " for children matching " + channels[channelIndex].pattern);
                    }
                }
                model.addAnimation(animation);
            }
        } else {
            if (animationCount > 0) console.warn("Model #" + objectIndex + " '" + name + "' has " + animationCount + " animations but is not a root");
        }

        return model;
    };

    public.loadFromBuffer = function(buffer, assetCatalog){
        if (!assetCatalog) assetCatalog = frag.AssetCatalog(engine);

        const bytes = new Uint8Array(buffer);
        const header = new DataView(buffer, 0, bytes.length);

        const version = bytes[0];
        const headerLength = header.getUint32(4, littleEndian);
        var headerOffset = 8;
        const dataOffset = headerOffset + headerLength;

        if (engine.debugPackageLoader)
            console.log("Asset pack V" + version + " is " + bytes.length + " bytes with " + headerLength + " header bytes");

        const context = {
            assetCatalog,
            header,
            data: buffer,
            dataOffset,
            materials: {},
            meshes: {},
            animations: {},
            models: {},
            fonts: {}
        };

        if (version === 1) {
            var objectSize = header.getUint16(headerOffset, littleEndian);
            var expectedObjectIndex = 0;
            while (objectSize !== 0) {
                const objectIndex = header.getUint16(headerOffset + 2, littleEndian);
                const objectType = header.getUint8(headerOffset + 4);
                const objectOffset = headerOffset + 5;

                if (objectIndex !== expectedObjectIndex++) {
                    console.error("Object indexes are not consecutive");
                    return;
                }

                if (objectType === 0) break;

                if (objectType === 1) {
                    context.materials[objectIndex] = private.loadMaterialV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 2) {
                    context.meshes[objectIndex] = private.loadMeshV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 3) {
                    context.animations[objectIndex] = private.loadAnimationV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 4) {
                    context.models[objectIndex] = private.loadModelV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 5) {
                    context.fonts[objectIndex] = private.loadFontV1(context, objectIndex, objectOffset);
                }
                else console.error("Unknown object type " + objectType);

                headerOffset += objectSize;
                objectSize = header.getUint16(headerOffset, littleEndian);
            }
        } else {
            console.error("Version " + version + " asset packs are not supported");
        }
        return assetCatalog
    };

    public.loadFromUrl = function (url, assetCatalog, onload) {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "arraybuffer";
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                assetCatalog = public.loadFromBuffer(this.response, assetCatalog);
                if (onload) onload(assetCatalog)
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    };

    return public;
};
