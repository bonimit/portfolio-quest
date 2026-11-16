import {boundedOrbit,orbitFit} from './map-orbit.ts';
import {captureSceneFrame} from './scene-transition.ts';
import {cameraMatrix,lookAt,multiply,ortho,renderSize,project,worldPixelsPerUnit,type Mat4} from './math.ts';
import {projectBuildings} from './building-interaction.ts';
import {makeWorld,LANDMARKS} from './world.ts';
import {atmosphere,worldPalette} from './palette.ts';
import {DEFAULT_VARIANT,type SceneVariant} from './variants.ts';
import {IslandActors,type Actors} from './actors.ts';
import {observeGuideVisibility} from '../../guide/observe-visibility.ts';
export type QuestPath = 'portfolio' | 'world';
export type QuestRenderer = ReturnType<typeof createQuestRenderer>;
const vertex = `#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;
layout(location=2) in float a_material;
layout(location=3) in float a_tone;
layout(location=4) in float a_part;
uniform mat4 u_model;
uniform float u_pet;
uniform vec2 u_gait;
uniform mat4 u_camera;
uniform mat4 u_sunCamera;
uniform float u_time;
out vec3 v_world;
out vec3 v_normal;
out vec4 v_shadow;
flat out int v_material;
out float v_tone;
void main(){
 vec3 p=a_position;
 if(u_pet>.5){
  if(a_part>.5){
   float phase=u_gait.x+(a_part==1.||a_part==4.?0.:3.14159);
   p.z+=sin(phase)*.18*u_gait.y*max(0.,(.55-p.y)/.55);
   p.y+=max(0.,cos(phase))*.07*u_gait.y*max(0.,(.55-p.y)/.55);
  }
  if(p.y>.04)p.y+=sin(u_gait.x*2.)*.018*u_gait.y;
 }
 p=(u_model*vec4(p,1.)).xyz;
 // Only foliage and cloud tips move; the architecture and ground stay anchored.
 if(u_pet<.5 && a_material>5.5 && a_material<6.5) p.x+=sin(u_time*.7+p.z+p.y)*.025*max(0.,p.y-.5);
 if(u_pet<.5 && a_material>9.5 && a_material<10.5){
  // Rigid, shared translation per cluster: no vertex shearing or rippling cloud body.
  float phase=p.z>3.?2.3:(p.x<0.?0.:1.6);
  p.x+=sin(u_time*.12+phase)*.12;p.y+=sin(u_time*.1+phase)*.035;
 }
 v_world=p;v_normal=mat3(u_model)*a_normal;v_material=int(a_material+.5);v_tone=a_tone;
 v_shadow=u_sunCamera*vec4(p,1.);gl_Position=u_camera*vec4(p,1.);
}`;
const fragment = `#version 300 es
precision highp float;
precision highp int;
in vec3 v_world;
in vec3 v_normal;
in vec4 v_shadow;
flat in int v_material;
in float v_tone;
uniform vec3 u_palette[20];
uniform vec3 u_fog;
uniform vec3 u_sky;
uniform vec3 u_sun;
uniform float u_fill;
uniform float u_exposure;
uniform vec3 u_direction;
uniform vec3 u_ground;
uniform float u_shadowFloor;
uniform float u_cloudGain;
uniform float u_time;
uniform float u_dusk;
uniform float u_focus;
uniform float u_city;
uniform sampler2D u_shadow;
out vec4 color;
float shadow(vec3 n){
 vec3 p=v_shadow.xyz/v_shadow.w*.5+.5;
 if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return 1.;
 float bias=max(.0015*(1.-dot(n,normalize(u_direction))),.0005),lit=0.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  float depth=texture(u_shadow,p.xy+vec2(float(x),float(y))/1024.).r;
  lit+=p.z-bias<=depth?1.:u_shadowFloor;
 }
 return lit/9.;
}
void main(){
 vec3 n=normalize(v_normal),base=u_palette[v_material]*v_tone;
 float diffuse=max(0.,dot(n,normalize(u_direction)));
 float sky=.5+.5*n.y;
 float occlusion=mix(.72,1.,smoothstep(-4.,2.,v_world.y));
 vec3 fill=mix(u_ground,u_sky,sky)*u_fill;
 // Fine material grain and staggered mortar add depth without external textures.
 float grain=fract(sin(dot(v_world,vec3(47.2,83.1,29.7)))*43758.5453);
 if(v_material!=10)base*=.96+grain*.07;
 if(v_material==3&&u_city<.5){
   float row=floor(v_world.y*6.);
   float mortar=max(step(.93,fract(v_world.y*6.)),step(.95,fract((abs(n.x)>.5?v_world.z:v_world.x)*3.+mod(row,2.)*.5)));
   base=mix(base,u_palette[14],mortar*.25);
 }
 vec3 result=base*(fill+u_sun*diffuse*shadow(n)*.83)*occlusion;
 // Warm lantern bounce is local to the path and landmark entries, not a color filter.
 float tower=exp(-length(v_world-vec3(-5.3,1.4,-.8))*.65);
 float gate=exp(-length(v_world-vec3(5.1,1.4,-1.8))*.7);
 result+=base*vec3(.8,.34,.09)*(tower+gate)*u_dusk*.45;
 if(v_material==17)result=mix(result,u_sky*.65,mix(.45,.12,u_dusk))+vec3(.05)*pow(max(n.y,0.),4.)+vec3(.2,.075,.018)*u_dusk;
 if(v_material==9)result=base*(1.1+u_dusk*.75);
 if(v_material==7){
  float ripple=sin(v_world.x*8.+v_world.z*5.+u_time*.7)*sin(v_world.z*7.-u_time*.5);
  result+=vec3(.11,.17,.17)*smoothstep(.6,1.,ripple);
 }
 if(v_material==10){
  float rounded=.72+.28*max(0.,dot(n,normalize(vec3(-.6,1.,.4))));
  result=mix(base,u_fog,mix(.12,.35,u_dusk))*u_cloudGain*rounded;
 }
 float emphasis=u_focus<-.1?tower:u_focus>.1?gate:0.;
 // Local architectural glow follows the selected building, never the whole island.
 float building=u_focus<-.1?exp(-length((v_world-vec3(-5.3,2.,-2.8))*vec3(.4,.18,.4))):u_focus>.1?exp(-length((v_world-vec3(5.1,2.,-2.8))*vec3(.4,.2,.4))):0.;
 result+=vec3(1.,.48,.12)*building*abs(u_focus)*.3+base*emphasis*.18;
 float fog=clamp((length(v_world.xz)*.003+max(0.,-v_world.y)*.025),0.,.35);
 result=mix(result,u_fog,fog);
 result=vec3(1.)-exp(-max(result,vec3(0.))*u_exposure);
 color=vec4(pow(result,vec3(1./2.2)),1.);
}`;
const depthVertex = `#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 a_position;
layout(location=2) in float a_material;
uniform mat4 u_sunCamera;
flat out int v_material;
void main(){v_material=int(a_material+.5);gl_Position=u_sunCamera*vec4(a_position,1.);}`;
const depthFragment = `#version 300 es
precision highp float;
precision highp int;
flat in int v_material;
void main(){if(v_material==7 || v_material==10)discard;}`;
/** Two batched draws (one static depth pass + one shaded scene); no engine dependency. */
export function createQuestRenderer(canvas: HTMLCanvasElement,onPositions: (positions: Record<QuestPath|'guide',{x:number;y:number}>)=>void,onFailure: ()=>void) {
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!gl)throw new Error('WebGL 2 unavailable');
  const shaders: WebGLShader[]=[],programs: WebGLProgram[]=[];
  let buffer: WebGLBuffer|null=null,vao: WebGLVertexArrayObject|null=null,depth: WebGLTexture|null=null,fbo: WebGLFramebuffer|null=null;
  let disposed=false,frame=0,width=1,height=1,activeUntil=0,time=0,last=0;
  let hidden=false,visible=true,paused=true,reduced=false,variant:SceneVariant=DEFAULT_VARIANT;
  let geometryKey=`${variant.city}-${variant.season}`;
  let palette=worldPalette(variant),weather=atmosphere(variant);
  let focus=0,targetFocus=0,panX=0,panY=0,targetX=0,targetY=0,shadowDirty=true;
  let yaw=0,pitch=0;
  const viewCamera=()=>cameraMatrix(width,height,focus,panX,panY,yaw,pitch);
  let actorPoses:Actors=new IslandActors().poses;
  const identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  const locations=new Map<string,WebGLUniformLocation|null>();
  const clean=()=>{
    cancelAnimationFrame(frame);frame=0;
    programs.forEach(p=>gl.deleteProgram(p));shaders.forEach(s=>gl.deleteShader(s));
    if(buffer)gl.deleteBuffer(buffer);if(vao)gl.deleteVertexArray(vao);if(depth)gl.deleteTexture(depth);if(fbo)gl.deleteFramebuffer(fbo);
  };
  function compile(type:number,source:string) {
    const shader=gl!.createShader(type);if(!shader)throw new Error('Shader allocation failed');shaders.push(shader);
    gl!.shaderSource(shader,source);gl!.compileShader(shader);
    if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS))throw new Error(gl!.getShaderInfoLog(shader)||'Shader compile failed');
    return shader;
  }
  function program(v:string,f:string) {
    const p=gl!.createProgram();if(!p)throw new Error('Program allocation failed');programs.push(p);
    gl!.attachShader(p,compile(gl!.VERTEX_SHADER,v));gl!.attachShader(p,compile(gl!.FRAGMENT_SHADER,f));gl!.linkProgram(p);
    if(!gl!.getProgramParameter(p,gl!.LINK_STATUS))throw new Error('Program link failed');return p;
  }
  let main:WebGLProgram,shadow:WebGLProgram,count:number;
  try {
    main=program(vertex,fragment);shadow=program(depthVertex,depthFragment);
    const geometry=makeWorld(variant);count=geometry.length/8;
    buffer=gl.createBuffer();vao=gl.createVertexArray();depth=gl.createTexture();fbo=gl.createFramebuffer();
    if(!buffer||!vao||!depth||!fbo)throw new Error('GPU allocation failed');
    gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,geometry,gl.STATIC_DRAW);
    for(const [attribute,size,offset] of [[0,3,0],[1,3,12],[2,1,24],[3,1,28]]){gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,size,gl.FLOAT,false,32,offset);}
    gl.bindTexture(gl.TEXTURE_2D,depth);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,1024,1024,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depth,0);
    gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Shadow target unavailable');
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  } catch(error) {clean();throw error;}
  let sunCamera=multiply(ortho(-21,21,-21,21,.1,85),lookAt(weather.direction,[0,0,0]));
  function uniform(p:WebGLProgram,name:string) {
    const key=(p===main?'main:':'shadow:')+name;
    if(!locations.has(key))locations.set(key,gl!.getUniformLocation(p,name));return locations.get(key)!;
  }
  const mat=(p:WebGLProgram,name:string,value:Mat4)=>gl!.uniformMatrix4fv(uniform(p,name),false,value);
  function draw() {
    if(disposed||hidden||!visible||gl!.isContextLost())return;
    gl!.bindVertexArray(vao);
    if(shadowDirty){
      gl!.bindFramebuffer(gl!.FRAMEBUFFER,fbo);gl!.viewport(0,0,1024,1024);gl!.clear(gl!.DEPTH_BUFFER_BIT);
      gl!.useProgram(shadow);mat(shadow,'u_sunCamera',sunCamera);gl!.drawArrays(gl!.TRIANGLES,0,count);shadowDirty=false;
    }
    gl!.bindFramebuffer(gl!.FRAMEBUFFER,null);gl!.viewport(0,0,canvas.width,canvas.height);gl!.clear(gl!.COLOR_BUFFER_BIT|gl!.DEPTH_BUFFER_BIT);gl!.useProgram(main);
    const camera=viewCamera();
    mat(main,'u_camera',camera);mat(main,'u_sunCamera',sunCamera);mat(main,'u_model',identity);
    gl!.uniform1f(uniform(main,'u_pet'),0);gl!.uniform2f(uniform(main,'u_gait'),0,0);
    gl!.uniform3fv(uniform(main,'u_palette[0]'),palette);
    gl!.uniform3fv(uniform(main,'u_fog'),weather.fog);gl!.uniform3fv(uniform(main,'u_sky'),weather.sky);gl!.uniform3fv(uniform(main,'u_sun'),weather.sun);
    gl!.uniform3fv(uniform(main,'u_direction'),weather.direction);gl!.uniform3fv(uniform(main,'u_ground'),weather.ground);
    gl!.uniform1f(uniform(main,'u_shadowFloor'),weather.shadowFloor);gl!.uniform1f(uniform(main,'u_cloudGain'),weather.cloudGain);
    gl!.uniform1f(uniform(main,'u_fill'),weather.fill);gl!.uniform1f(uniform(main,'u_exposure'),weather.exposure);
    gl!.uniform1f(uniform(main,'u_city'),variant.city==='nyc'?0:variant.city==='tokyo'?1:2);
    gl!.uniform1f(uniform(main,'u_time'),time);gl!.uniform1f(uniform(main,'u_dusk'),variant.light==='night'?1:0);gl!.uniform1f(uniform(main,'u_focus'),focus);
    gl!.activeTexture(gl!.TEXTURE0);gl!.bindTexture(gl!.TEXTURE_2D,depth);gl!.uniform1i(uniform(main,'u_shadow'),0);
    gl!.drawArrays(gl!.TRIANGLES,0,count);
    onPositions({portfolio:project(camera,LANDMARKS.portfolio,width,height),world:project(camera,LANDMARKS.world,width,height),guide:project(camera,[actorPoses.guide.x,.4,actorPoses.guide.z],width,height)});
    if(gl!.getError()!==gl!.NO_ERROR){onFailure();destroy();}
  }
  function tick(now:number) {
    frame=0;if(disposed||hidden||!visible)return;
    const moving=!paused&&!reduced;
    if(moving && now-last<1000/30){frame=requestAnimationFrame(tick);return;}
    const delta=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    const ease=moving?1-Math.exp(-delta*7):1;
    focus+=(targetFocus-focus)*ease;panX+=(targetX-panX)*ease;panY+=(targetY-panY)*ease;
    if(moving)time+=delta;
    try { draw(); } catch { onFailure();destroy(); }
    if(moving&&now<activeUntil&&!disposed)frame=requestAnimationFrame(tick);
  }
  function invalidate(duration=800) {
    if(disposed)return;
    activeUntil=Math.max(activeUntil,performance.now()+duration);
    if(!frame&&!hidden&&visible){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function resize() {
    width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);
    const size=renderSize(width,height,devicePixelRatio||1);
    const maximum=gl!.getParameter(gl!.MAX_RENDERBUFFER_SIZE) as number;
    const cap=Math.min(1,maximum/size.width,maximum/size.height);
    canvas.width=Math.floor(size.width*cap);canvas.height=Math.floor(size.height*cap);invalidate(150);
  }
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(resize);observer?.observe(canvas);
  window.addEventListener('resize',resize);
  const stopObserving=observeGuideVisibility(canvas,(isVisible)=>{
    visible=isVisible;if(visible)invalidate(500);else{cancelAnimationFrame(frame);frame=0;}
  });
  const visibility=()=>{hidden=document.hidden;if(hidden){cancelAnimationFrame(frame);frame=0;}else invalidate(500);};
  const contextLost=(event:Event)=>{event.preventDefault();onFailure();destroy();};
  document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);
  function destroy(){
    if(disposed)return;disposed=true;observer?.disconnect();stopObserving();window.removeEventListener('resize',resize);
    document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);clean();
  }
  resize();invalidate(5500);
  return {
    destroy,
    variant(next:SceneVariant,snapshot?:HTMLCanvasElement){
      if(disposed||next.city===variant.city&&next.season===variant.season&&next.light===variant.light)return false;
      // Capture the live projection before replacing geometry: no fixed-art ghosting.
      if(snapshot){
        draw();captureSceneFrame(canvas,snapshot);
      }
      const nextKey=`${next.city}-${next.season}`;
      if(nextKey!==geometryKey){
        const geometry=makeWorld(next);
        gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);gl!.bufferData(gl!.ARRAY_BUFFER,geometry,gl!.STATIC_DRAW);
        count=geometry.length/8;geometryKey=nextKey;shadowDirty=true;
      }
      variant=next;palette=worldPalette(next);weather=atmosphere(next);sunCamera=multiply(ortho(-21,21,-21,21,.1,85),lookAt(weather.direction,[0,0,0]));shadowDirty=true;invalidate(2600);return true;
    },
    motion(nextPaused:boolean,nextReduced:boolean){paused=nextPaused;reduced=nextReduced;if(paused||reduced){targetFocus=focus;targetX=panX;targetY=panY;}cancelAnimationFrame(frame);frame=0;invalidate(250);},
    focus(path:QuestPath|null){if(paused||reduced)return;targetFocus=path==='portfolio'?-.9:path==='world'?.9:0;invalidate(1700);},
    pointer(x:number,y:number){if(paused||reduced)return;targetX=Math.max(-1,Math.min(1,x));targetY=Math.max(-1,Math.min(1,y));invalidate(900);},
    actors(poses:Actors){
      actorPoses=poses;invalidate(0);
      return project(viewCamera(),[poses.guide.x,.4,poses.guide.z],width,height);
    },
    buildings(){return projectBuildings(variant,viewCamera(),width,height);},
    projectFloor(x:number,z:number){return project(viewCamera(),[x,.4,z],width,height);},
    orbit(nextYaw:number,nextPitch:number){
      ({yaw,pitch}=boundedOrbit(nextYaw,nextPitch));invalidate(0);
    },
    pixelsPerUnit(){return worldPixelsPerUnit(width,height)/orbitFit(yaw,pitch);},
    wake(){invalidate(3500);},
    get stats(){return {vertices:count,triangles:count/3,shadowSize:1024,maxDpr:1.6};},
  };
}
