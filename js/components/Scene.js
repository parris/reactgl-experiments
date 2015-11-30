import pureRender from 'pure-render-decorator';
import React, {Component} from 'react';
import twgl, {m4} from 'twgl.js';

import fancyCubeFragmentShader from './shaders/fancy_cube_fs.glsl';
import fancyCubeVertexShader from './shaders/fancy_cube_vs.glsl';


@pureRender
export class Cube extends Component {

    static contextTypes = {
        getCanvas: React.PropTypes.func,
        getGL: React.PropTypes.func,
        getCamera: React.PropTypes.func,
        isReady: React.PropTypes.bool,
    }

    componentWillMount() {
        let gl = this.context.getGL();

        this.arrays = {
            position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
            normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
            texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
            indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
        };

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, this.arrays);
        this.programInfo = twgl.createProgramInfoFromProgram(
            gl,
            twgl.createProgramFromSources(gl, [
                fancyCubeVertexShader,
                fancyCubeFragmentShader
            ])
        );
        this.texture = twgl.createTexture(gl, {
            min: gl.NEAREST,
            mag: gl.NEAREST,
            src: [
                255, 255, 255, 255,
                192, 192, 192, 255,
                192, 192, 192, 255,
                255, 255, 255, 255,
            ],
        });

        gl.useProgram(this.programInfo.program);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
    }

    render() {
        let gl = this.context.getGL();

        let uniforms = Object.assign({
            u_lightWorldPos: [1, 8, -10],
            u_lightColor: [1, 0.8, 0.8, 1],
            u_ambient: [0, 0, 0, 1],
            u_specular: [1, 1, 1, 1],
            u_shininess: 50,
            u_specularFactor: 1,
            u_diffuse: this.texture,
        }, this.context.getCamera().data.uniforms);

        twgl.setUniforms(this.programInfo, uniforms);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.bufferInfo);

        return false;
    }

}

export class Camera {

    constructor(width, height, rotation) {
        this.recalculate(width, height, rotation);
    }

    recalculate(width, height, rotation) {
        let projection = m4.perspective(30 * Math.PI / 180, width / height, 0.5, 10);
        let eye = [1, 4, -6];
        let target = [0, 0, 0];
        let up = [0, 1, 0];
        let camera = m4.lookAt(eye, target, up);
        let view = m4.inverse(camera);
        let viewProjection = m4.multiply(view, projection);
        let world = m4.rotationY(rotation);
        let uniforms = {
            u_viewInverse: camera,
            u_world: world,
            u_worldInverseTranspose: m4.transpose(m4.inverse(world)),
            u_worldViewProjection: m4.multiply(world, viewProjection),
        };

        this.data = {
            projection, eye, target, up, camera,
            view, viewProjection, world, uniforms,
        };
    }

}

@pureRender
export class Scene extends Component {

    static childContextTypes = {
        getCanvas: React.PropTypes.func,
        getGL: React.PropTypes.func,
        getCamera: React.PropTypes.func,
        isReady: React.PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            camera: new this.props.Camera(0, 0),
            isReady: false,
        };
    }

    getChildContext() {
        var self = this;

        return {
            getCanvas() {
                return self.refs.canvas || {};
            },
            getGL() {
                if (self.refs.canvas) {
                    return twgl.getWebGLContext(self.refs.canvas);
                }

                return {};
            },
            getCamera() {
                return self.state.camera;
            },
            isReady: this.state.isReady,
        };
    }
    componentDidMount() {
        this.setState({ isReady: true });
    }

    render() {
        let canvas = this.refs.canvas;
        let gl = twgl.getWebGLContext(canvas);

        if (this.refs.canvas) {
            this.state.camera.recalculate(this.refs.canvas.clientWidth, this.refs.canvas.clientHeight, this.props.rotation);

            twgl.resizeCanvasToDisplaySize(this.refs.canvas);
            gl.viewport(0, 0, this.refs.canvas.clientWidth, this.refs.canvas.clientHeight);

            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        return (
            <canvas
                ref="canvas"
                width={this.props.width}
                height={this.props.height}
                style={{width:this.props.width,height:this.props.height,}}
            >
                { this.state.isReady ? this.props.children : '' }
            </canvas>
        );
    }
}
