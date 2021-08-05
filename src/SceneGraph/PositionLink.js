window.frag.PositionLink = function(engine) {
    const private = {
        source: null,
        dest: null,
        locationOffset: null,
        scaleOffset: null,
        rotationOffset: null,
        lookAtOffset: null,
    };

    const public = {
        __private: private,
    };

    public.dispose = function() {
        if (private.source) {
            private.source.observableLocation.unsubscribe(private.sourceChanged);
        }
    }

    private.sourceChanged = function(location) {
        if (!private.dest) return;

        if (private.locationOffset) {
            if (private.locationOffset[0] !== undefined && 
                private.locationOffset[1] !== undefined && 
                private.locationOffset[2] !== undefined) {
                private.dest.locationXYZ(
                    location.translateX + private.locationOffset[0],
                    location.translateY + private.locationOffset[1],
                    location.translateZ + private.locationOffset[2]);

            } else {
                if (private.locationOffset[0] !== undefined)
                    private.dest.locationX(location.translateX + private.locationOffset[0]);
                if (private.locationOffset[1] !== undefined)
                    private.dest.locationY(location.translateY + private.locationOffset[1]);
                if (private.locationOffset[2] !== undefined)
                    private.dest.locationZ(location.translateZ + private.locationOffset[2]);
            }
        }
        if (private.scaleOffset) {
            if (private.scaleOffset[0] !== undefined && 
                private.scaleOffset[1] !== undefined && 
                private.scaleOffset[2] !== undefined) {
                private.dest.scaleXYZ(
                    location.scaleX + private.scaleOffset[0],
                    location.scaleY + private.scaleOffset[1],
                    location.scaleZ + private.scaleOffset[2]);

            } else {
                if (private.scaleOffset[0] !== undefined)
                    private.dest.scaleX(location.scaleX * private.scaleOffset[0]);
                if (private.scaleOffset[1] !== undefined)
                    private.dest.scaleY(location.scaleY * private.scaleOffset[1]);
                if (private.scaleOffset[2] !== undefined)
                    private.dest.scaleZ(location.scaleZ * private.scaleOffset[2]);
            }
        }
        if (private.lookAtOffset) {
            const sourceLocation = private.source.getLocation();
            const destLocation =  private.dest.getLocation();
            const heading = window.frag.Vector.heading(window.frag.Vector.sub(sourceLocation, destLocation));
            if (private.lookAtOffset[0] !== undefined && 
                private.lookAtOffset[1] !== undefined && 
                private.lookAtOffset[2] !== undefined) {
                private.dest.rotateXYZ(
                    heading[0] + private.lookAtOffset[0],
                    heading[1] + private.lookAtOffset[1],
                    heading[2] + private.lookAtOffset[2]);

            } else {
                if (private.lookAtOffset[0] !== undefined)
                    private.dest.rotateX(heading[0] + private.lookAtOffset[0]);
                if (private.lookAtOffset[1] !== undefined)
                    private.dest.rotateY(heading[1] + private.lookAtOffset[1]);
                if (private.lookAtOffset[2] !== undefined)
                    private.dest.rotateZ(heading[2] + private.lookAtOffset[2]);
            }
        }
        if (private.rotationOffset) {
            if (private.rotationOffset[0] !== undefined && 
                private.rotationOffset[1] !== undefined && 
                private.rotationOffset[2] !== undefined) {
                private.dest.rotateXYZ(
                    location.rotateX + private.rotationOffset[0],
                    location.rotateY + private.rotationOffset[1],
                    location.rotateZ + private.rotationOffset[2]);

            } else {
                if (private.rotationOffset[0] !== undefined)
                    private.dest.rotateX(location.rotateX + private.rotationOffset[0]);
                if (private.rotationOffset[1] !== undefined)
                    private.dest.rotateY(location.rotateY + private.rotationOffset[1]);
                if (private.rotationOffset[2] !== undefined)
                    private.dest.rotateZ(location.rotateZ + private.rotationOffset[2]);
            }
        }
    }

    public.source = function(scenePosition) {
        if (private.source) {
            private.source.observableLocation.unsubscribe(private.sourceChanged);
        }
        
        if (scenePosition && scenePosition.getPosition)
            scenePosition = scenePosition.getPosition();

        private.source = scenePosition;
        if (scenePosition) {
            scenePosition.observableLocation.subscribe(private.sourceChanged);
        }
        return public
    }

    public.dest = function(scenePosition) {
        if (scenePosition && scenePosition.getPosition)
            scenePosition = scenePosition.getPosition();
        private.dest = scenePosition;
        return public
    }

    public.locationOffset = function(offset) {
        private.locationOffset = offset;
        return public
    }

    public.scaleOffset = function(offset) {
        private.scaleOffset = offset;
        return public
    }

    public.rotationOffset = function(offset) {
        private.rotationOffset = offset;
        return public
    }

    public.lookAtOffset = function(offset) {
        private.lookAtOffset = offset;
        return public
    }

    return public;
}