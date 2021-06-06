﻿window.frag.ModelLoader = (function () {
    const frag = window.frag;

    const uInt32 = new Uint32Array([0x11223344]);
    const uInt8 = new Uint8Array(uInt32.buffer);
    const littleEndian = uInt8[0] === 0x44;

    const private = {
    }

    const public = {
        __private: private,
        littleEndian
    };

    private.loadMaterialV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }
        const material = context.materialStore.getMaterial(name);
        if (frag.debugModelLoader)
            console.log("Object[" + objectIndex + "] is material " + name);
        return material;
    }

    private.loadMeshV1 = function (context, objectIndex, headerOffset) {
        const mesh = frag.MeshData();
        const fragmentCount = context.header.getUint16(headerOffset, littleEndian);
        headerOffset += 2;
        if (frag.debugModelLoader)
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

            if (frag.debugModelLoader) {
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

            const vertexData = frag.VertexData();
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

        if (frag.debugModelLoader) {
            let msg = "Object[" + objectIndex + "] is '" + name + "' animation which runs for " + frames + "x" + interval + " frames";
            if (loop) msg += ". Repeats until stopped";
            if (reverse) msg += ". Plays in reverse after playing forwards";
            console.log(msg);
        }

        const modelAnimation = frag.ModelAnimation()
            .name(name)
            .loop(loop)
            .frames(frames)
            .interval(interval / window.frag.gameTickMs);

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

        const transform = frag.Transform()
            .translateXYZ(context.header.getFloat32(headerOffset + 0, littleEndian), context.header.getFloat32(headerOffset + 4, littleEndian), context.header.getFloat32(headerOffset + 8, littleEndian))
            .rotateXYZ(context.header.getFloat32(headerOffset + 12, littleEndian), context.header.getFloat32(headerOffset + 16, littleEndian), context.header.getFloat32(headerOffset + 20, littleEndian))
            .scaleXYZ(context.header.getFloat32(headerOffset + 24, littleEndian), context.header.getFloat32(headerOffset + 28, littleEndian), context.header.getFloat32(headerOffset + 32, littleEndian));
        headerOffset += 36;

        const childCount = context.header.getUint16(headerOffset, littleEndian);
        const animationCount = context.header.getUint16(headerOffset + 2, littleEndian);
        headerOffset += 4;

        const isRoot = (modelFlags & 1) === 1;
        const hasMaterial = (modelFlags & 2) === 2;
        const hasMesh = (modelFlags & 4) === 4;

        if (frag.debugModelLoader)
            console.log("Object[" + objectIndex + "] is " + (isRoot ? "root " : "") + "model " + name + " with " + childCount + " children and " + animationCount + " animations. Paint mesh " + meshIndex + " with material " + materialIndex);

        const model = context.modelStore.getModel(name, !isRoot).transform(transform);
        if (hasMaterial) model.material(context.materials[materialIndex]);
        if (hasMesh) model.mesh(context.meshes[meshIndex]);

        for (let i = 0; i < childCount; i++) {
            const modelIndex = context.header.getUint16(headerOffset, littleEndian);
            headerOffset += 2;
            model.addChild(context.models[modelIndex]);
        }

        if (isRoot) {
            if (frag.debugAnimations && animationCount > 0)
                console.log("Model #" + objectIndex + " '" + name + "' has " + animationCount + " animations");
            for (let i = 0; i < animationCount; i++) {
                const animationIndex = context.header.getUint16(headerOffset, littleEndian);
                headerOffset += 2;

                const animation = context.animations[animationIndex];
                if (frag.debugAnimations) {
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

    public.loadModelsFromBuffer = function(modelStore, materialStore, buffer){
        const bytes = new Uint8Array(buffer);
        const header = new DataView(buffer, 0, bytes.length);

        const version = bytes[0];
        const headerLength = header.getUint32(4, littleEndian);
        var headerOffset = 8;
        const dataOffset = headerOffset + headerLength;

        if (frag.debugModelLoader)
            console.log("Model pack V" + version + " is " + bytes.length + " bytes with " + headerLength + " header bytes");

        const context = {
            modelStore,
            materialStore,
            header,
            data: buffer,
            dataOffset,
            materials: {},
            meshes: {},
            animations: {},
            models: {}
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
                else console.error("Unknown object type " + objectType);

                headerOffset += objectSize;
                objectSize = header.getUint16(headerOffset, littleEndian);
            }
        } else {
            console.error("Version " + version + " model packs are not supported");
        }
    };

    public.loadModelsFromUrl = function (modelStore, materialStore, url) {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "arraybuffer";
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                public.loadModelsFromBuffer(modelStore, materialStore, this.response);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    };


    return public;
})();
