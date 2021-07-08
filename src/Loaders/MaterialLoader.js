window.frag.MaterialLoader = (function () {
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

    private.loadMipV1 = function (header, headerOffset, data, dataOffset, material, mipLevel, width, height) {
        const flags = header.getUint8(headerOffset++);

        const colorDataOffset = header.getUint32(headerOffset, littleEndian);
        if (frag.debugMaterialLoader)
            console.log("Color data at " + colorDataOffset);
        headerOffset += 4;

        const colorTexture = frag.Texture()
            .dataFormat((flags & 1) === 1 ? frag.gl.RGBA : frag.gl.RGB)
            .fromArrayBuffer(mipLevel, data, dataOffset + colorDataOffset, width, height);
        material.setTexture("diffuse", colorTexture);

        if ((flags & 2) === 2) {
            const surfaceDataOffset = header.getUint32(headerOffset, littleEndian);
            if (frag.debugMaterialLoader)
                console.log("Surface data at " + surfaceDataOffset);
            headerOffset += 4;

            const surfaceTexture = frag.Texture()
                .dataFormat(frag.gl.RGBA)
                .fromArrayBuffer(mipLevel, data, dataOffset + surfaceDataOffset, width, height);
            material.setTexture("surface", surfaceTexture);
        }

        if ((flags & 4) === 4) {
            const normalMapDataOffset = header.getUint32(headerOffset, littleEndian);
            if (frag.debugMaterialLoader)
                console.log("Normal map at " + normalMapDataOffset);
            headerOffset += 4;

            const normalMap = frag.Texture()
                .dataFormat(frag.gl.RGB)
                .fromArrayBuffer(mipLevel, data, dataOffset + normalMapDataOffset, width, height);
            material.setTexture("normalMap", normalMap);
        }

        if ((flags & 8) === 8) {
            const pbrDataOffset = header.getUint32(headerOffset, littleEndian);
            if (frag.debugMaterialLoader)
                console.log("PBR data at " + pbrDataOffset);
            headerOffset += 4;
            const pbrTexture = frag.Texture()
                .dataFormat(frag.gl.RGBA)
                .fromArrayBuffer(mipLevel, data, dataOffset + pbrDataOffset, width, height);
            material.setTexture("pbr", pbrTexture);
        }

        return headerOffset;
    }

    private.loadMaterialV1 = function (assetCatalog, header, headerOffset, data, dataOffset) {
        const nameLength = header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(header.getUint8(headerOffset++));
        }
        const material = assetCatalog.getMaterial(name);
        if (frag.debugMaterialLoader) {
            console.log("");
            console.log("Loading " + name + " material textures");
        }

        const maxMip = header.getUint8(headerOffset++);

        var width = 1 << maxMip;
        var height = width;
        var nextMip = 0;
        var mip;

        do {
            mip = header.getUint8(headerOffset++);
            if (frag.debugMaterialLoader)
                console.log("Loading MIP level " + mip + " at " + width + " x " + height + " pixels");

            if (mip !== nextMip)
                console.error("Mip levels are wrong for " + name + " texture");

            headerOffset = private.loadMipV1(header, headerOffset, data, dataOffset, material, mip, width, height);

            nextMip++;
            width >>>= 1;
            height >>>= 1;
        }
        while (mip !== 0)
    }


    public.loadMaterialsFromBuffer = function(buffer, assetCatalog){
        if (!assetCatalog) assetCatalog = frag.AssetCatalog();

        const bytes = new Uint8Array(buffer);
        const header = new DataView(buffer, 0, bytes.length);

        const version = bytes[0];
        const headerLength = header.getUint16(2, littleEndian);
        var headerOffset = 4;
        const dataOffset = headerOffset + headerLength;

        if (frag.debugMaterialLoader)
            console.log("Material pack V" + version + " is " + bytes.length + " bytes with " + headerLength + " header bytes");

        if (version === 1) {
            var textureSize = header.getUint16(headerOffset, littleEndian);
            while (textureSize !== 0) {
                private.loadMaterialV1(assetCatalog, header, headerOffset + 2, buffer, dataOffset);
                headerOffset += textureSize;
                textureSize = header.getUint16(headerOffset, littleEndian);
            }
        } else {
            console.error("Version " + version + " texture packs are not supported");
        }
        return assetCatalog;
    };

    public.loadMaterialsFromUrl = function (url, assetCatalog, onload) {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "arraybuffer";
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                assetCatalog = public.loadMaterialsFromBuffer(this.response, assetCatalog);
                if (onload) onload(assetCatalog);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    };

    return public;
})();
