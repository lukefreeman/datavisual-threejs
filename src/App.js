import React, { Component } from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber } from 'react-dat-gui';
import {connect} from 'react-redux';
import * as THREE from 'three';
import { VignetteEffect, HueSaturationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
const OrbitControls = require("three-orbit-controls")(THREE);
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';
import styled from 'styled-components';

class App extends Component {

    constructor() {
        super();

        this.scene;
        this.camera;
        this.renderer;
        this.controls;
        this.model;
        this.composer;

        this.state = {
            loading:0,
            data: {
                hue: 0,
                ambientLight: 0xd30000,
                wireframe: false
            }
        }
    }   

	/*
	|--------------------------------------------------------------------------
	| Update settings
	|--------------------------------------------------------------------------
	*/
    handleUpdate(data) {
        this.setState({ data });
        this.HueSat.effects[0].setHue(data.hue);
        this.state.data.wireframe !== data.wireframe ? this.setWireframe() : null;
    }

	/*
	|--------------------------------------------------------------------------
	| Toggle Wireframe
	|--------------------------------------------------------------------------
	*/
    setWireframe() {
        this.scene.traverse( ( child ) => {
            if ( child.isMesh ) {
                child.material.wireframe = !this.state.data.wireframe;
            }
        });
    }

    /*
	|--------------------------------------------------------------------------
	| Camera fly away
	|--------------------------------------------------------------------------
    */
    flyAway() {
        const tween = new TWEEN.Tween({
            x:176270.75252929013,
            y:-26073.99366690377,
            z:39148.29418709834
        }).to({x: 491010.04088835354, y: 317950.63986114773, z: 100720.7299043877}, 6000).easing(TWEEN.Easing.Linear.None).onUpdate((e)=> {
              this.camera.position.set(e.x, e.y, e.z);
        });
    
        tween.delay(500);
        tween.start();
    }

    /*
	|--------------------------------------------------------------------------
	| Position model & camera
	|--------------------------------------------------------------------------
	*/
    lookAtModel() {
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize().length();
        const center = box.getCenter();

        this.model.position.x += (this.model.position.x - center.x);
        this.model.position.y += (this.model.position.y - center.y);
        this.model.position.z += (this.model.position.z - center.z);
        
        this.camera.near = size / 100;
        this.camera.far = size * 100;
        this.camera.updateProjectionMatrix();
        
        this.camera.position.x = 176270.75252929013;
        this.camera.position.y = -26073.99366690377;
        this.camera.position.z = 39148.29418709834;
    }

	/*
	|--------------------------------------------------------------------------
	| Load GLTF model
	|--------------------------------------------------------------------------
	*/
    loadModel() {
        const loader = new GLTFLoader();

        loader.load( './model/DEM_RAST.pdf.gltf', 
            gltf => {

                this.model = gltf.scene;
                this.scene.add(this.model);

                //recursive find lines and points and hide ---
                this.model.traverse( function ( child ) {
                    if( child.type === "Line" || child.type === "Points") {
                        child.visible = false;
                    }
                });

                this.model.updateMatrixWorld();
                
                //center camera / model ---
                this.lookAtModel();

                //pan camera out --- 
                this.flyAway();

            },
            
            xhr => {
                console.log(Math.floor(xhr.loaded / xhr.total * 100 ));
                this.setState({ loading: ( Math.floor(xhr.loaded / xhr.total * 100 ) ) + '%' });
            } 
        );
    }

    /*
	|--------------------------------------------------------------------------
	| setup lighting
	|--------------------------------------------------------------------------
	*/
    setLighting() {
        const ambientLight = new THREE.AmbientLight( 0xd30000, 1.7 );
        this.scene.add( ambientLight );

        const directionalLight = new THREE.DirectionalLight( '0xffffff' , 2);
        this.scene.add( directionalLight );
    }

    /*
	|--------------------------------------------------------------------------
	| post processing effects
	|--------------------------------------------------------------------------
	*/
    postProcessing() {
        this.composer = new EffectComposer(this.renderer);

        //Vignette --
        const vignette = new EffectPass(this.camera, new VignetteEffect({
            darkness: 0.4,
            offset: 0.3,
        }));

        //HueSat ---
        this.HueSat = new EffectPass(this.camera, new HueSaturationEffect({
            hue: this.state.data.hue,
            sat: this.state.data.saturation
        }));
        
        //add effects ---
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(vignette);
        this.composer.addPass(this.HueSat);
        this.HueSat.renderToScreen = true;
    }

	/*
	|--------------------------------------------------------------------------
	| componentDidMount
	|--------------------------------------------------------------------------
	*/
    componentDidMount(){

        //create stats box ---
        var stats = new Stats();
        stats.showPanel( 0 );
        document.body.appendChild( stats.dom );
        
        //create scene ---
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xCCCCCC );

        //create camera ---
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        
        //create renderer ---
        this.renderer = new THREE.WebGLRenderer({ alpha: false });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        //adjust colour ---
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        //add canvas to dom ---
        this.mount.appendChild( this.renderer.domElement );

        //load GLTF model ---
        this.loadModel();

        //create orbit controls ---
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        //set lighting ---
        this.setLighting();
        
        //post processing effects ---
        this.postProcessing();
        
        //render loop ---
        var animate =  () => {
            stats.begin();
                TWEEN.update();
                this.composer.render( this.scene, this.camera );
                this.controls.update();
            stats.end();

            requestAnimationFrame( animate );
        };

        animate();
    }


	/*
	|--------------------------------------------------------------------------
	| Render
	|--------------------------------------------------------------------------
	*/
    render() {

        const { data } = this.state;

        return (
            <div>
                <Loading pc={this.state.loading} >{this.state.loading}</Loading>
                <DatGui data={data} onUpdate={this.handleUpdate.bind(this)}>
                    <DatNumber path='hue' label='Colour' min={-3.142} max={3.142} step={.01} />
                    <DatBoolean path='wireframe' label='Wireframe' value={this.state.data.wireframe} />
                    <DatColor path='ambientLight' label='Ambient Light' value={this.state.data.ambientLight} />
                </DatGui>
                <div ref={ref => (this.mount = ref)} />
            </div>
        );
    }  
}

function mapStateToProps(state){
	return { 
	}
}

export default connect(mapStateToProps, {  })(App);

const Loading = styled.div`
    position:absolute;
    top:50%;
    left:50%;
    z-index:99;
    transform:translateX(-50%) translateY(-50%);
    font-size:30px;
    display: ${(props) => props.pc === '100%' ? 'none' : 'block'}
    color:#000;
`