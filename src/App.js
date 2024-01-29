import anime from 'animejs/lib/anime.es.js';

import React, { useRef, useState,useEffect } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const decoyCanvasRef = useRef(null);
  const requestRef = useRef();
  let playInterval;
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState("");
  const [preset, setPreset] = useState('default');
  const [currentSegment, setCurrentSegment] = useState(null);
  const [animationClass, setAnimationClass] = useState('');
  const [letterAnimations, setLetterAnimations] = useState([]);

  



  const drawVideoFrame = (time) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const canvasAspectRatio = canvas.width / canvas.height;
      let drawWidth;
      let drawHeight;
      let posX;
      let posY;
  
      // Calculate the dimensions for the video to fit the canvas while maintaining aspect ratio
      if (videoAspectRatio > canvasAspectRatio) {
        // Video is wider than canvas
        drawWidth = canvas.width;
        drawHeight = drawWidth / videoAspectRatio;
        posX = 0;
        posY = (canvas.height - drawHeight) / 2; // Center vertically
      } else {
        // Video is taller than canvas
        drawHeight = canvas.height;
        drawWidth = drawHeight * videoAspectRatio;
        posX = (canvas.width - drawWidth) / 2; // Center horizontally
        posY = 0;
      }
  
      // Clear the canvas and draw the frame
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, posX, posY, drawWidth, drawHeight);
  
      // Set the current caption based on the video's playback time
      const currentTime = video.currentTime;
      const segment = captions.find(seg => currentTime >= seg.start && currentTime < seg.end);
    
      if (segment && segment.text !== currentCaption) {
        setCurrentCaption(segment.text);
        if (preset !== 'default') {
          initializeLetterAnimations(segment.text);
        }
      }
    
      if (segment) {
        if (preset !== 'default') {
          updateAndDrawAnimatedCaptions(context, time);
        } else {
          drawCaption(context, segment.text);
        }
      }
    }
    requestRef.current = requestAnimationFrame(drawVideoFrame);
  };

  const initializeLetterAnimations = (text) => {
    const letters = text.split('');
    setLetterAnimations(letters.map(letter => ({
      letter,
      scale: 1,
      opacity: 1,
      rotation: 0
    })));
  };

  
  const updateAndDrawAnimatedCaptions = (context, time)  => {
    const currentTime = Date.now(); // Current timestamp
  
    setLetterAnimations(currentAnimations => {
      return currentAnimations.map((anim, index) => {
        // Update properties based on the preset
        if (preset === 'preset1') {
          // Example: pulsing scale
          anim.scale = Math.sin(currentTime / 500) + 1;
        } else if (preset === 'preset2') {
          // Example: rotating letters
          anim.rotation += 2;
        }
  
        // Draw each letter with updated properties
        drawAnimatedLetter(context, anim, index);
  
        return anim;
      });
    });
  };
  
  
  const drawAnimatedLetter = (context, anim, index) => {
    const baseX = canvasRef.current.width / 2; // Center of the canvas
    const baseY = canvasRef.current.height - 30; // Y position from the bottom
  
    let xOffset = 0;
    for (let i = 0; i < index; i++) {
      xOffset += context.measureText(letterAnimations[i].letter).width;
    }
  
    const xPosition = baseX - (context.measureText(currentCaption).width / 2) + xOffset;
    const yPosition = baseY;
  
    context.save();
    context.translate(xPosition, yPosition);
    context.rotate(anim.rotation * Math.PI / 180);
    context.scale(anim.scale, anim.scale);
    context.globalAlpha = anim.opacity;
    context.fillText(anim.letter, 0, 0);
    context.restore();
  };
  
  

  const drawCaption = (context, text, preset) => {
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
  
    // Customize styles based on the preset
    switch (preset) {
      case 'preset1':
        context.font = 'bold 24px Arial';
        context.fillStyle = 'yellow';
        break;
      case 'preset2':
        context.font = 'italic 20px Times New Roman';
        context.fillStyle = 'lightblue';
        break;
      default:
        context.font = '18px Arial';
        context.fillStyle = 'white';
    }
  
    const textPositionY = canvasRef.current.height - 30;
    context.fillText(text, canvasRef.current.width / 2, textPositionY);
  };
  
  
  const animateCaptions = () => {
    // Ensure anime.js animations are only applied on the client-side
    if (typeof window !== 'undefined') {
      switch (preset) {
        case 'preset1':
          anime.timeline({ loop: true })
            .add({
              targets: '.ml2 .letter',
              scale: [4, 1],
              opacity: [0, 1],
              translateZ: 0,
              easing: "easeOutExpo",
              duration: 950,
              delay: (el, i) => 70 * i
            }).add({
              targets: '.ml2',
              opacity: 0,
              duration: 1000,
              easing: "easeOutExpo",
              delay: 1000
            });
          break;
        case 'preset2':
          anime.timeline({ loop: true })
            .add({
              targets: '.ml10 .letter',
              rotateY: [-90, 0],
              duration: 1300,
              delay: (el, i) => 45 * i
            }).add({
              targets: '.ml10',
              opacity: 0,
              duration: 1000,
              easing: "easeOutExpo",
              delay: 1000
            });
          break;
        default:
          // No animation for default preset
          break;
      }
    }
  };
  
  // Call this function whenever the preset changes or the component mounts
  useEffect(() => {
    if (currentCaption && preset !== 'default') {
      const letters = currentCaption.split('');
      setLetterAnimations(letters.map(letter => ({
        letter,
        scale: 1,
        opacity: 1,
        rotation: 0 // Add other properties needed for animation
      })));
    }
  }, [currentCaption, preset]);
  
  
  const drawDecoyFrame = () => {
    const canvas = decoyCanvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      // Fill the canvas with the video frame but larger and blurred
      context.filter = 'blur(32px)'; // Apply a blur effect
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.filter = 'none'; // Reset the filter for other canvas operations
    }
  };

  const paintDecoy = () => {
    const canvas = decoyCanvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      context.filter = 'blur(32px)'; // Apply a blur effect
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.filter = 'none'; // Reset the filter for other canvas operations
    }
  };
  

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (videoPlaying) {
      video.pause();
      cancelAnimationFrame(requestRef.current);
      clearInterval(playInterval); // Clear the interval when video is paused
    } else {
      video.play();
      requestRef.current = requestAnimationFrame(drawVideoFrame);
      playInterval = setInterval(paintDecoy, 1000 / 30); // Set up the interval when video plays
    }
    setVideoPlaying(!videoPlaying);
  };
  

  // Clean up the requestAnimationFrame when the component unmounts
  // useEffect(() => {
  //   return () => cancelAnimationFrame(requestRef.current);
  // }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const decoyCanvas = decoyCanvasRef.current;
  
    const setCanvasDimensions = () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      const maxWidth = document.querySelector('.app').clientWidth * 0.85;
      const maxHeight = window.innerHeight * 0.8;
      let canvasWidth, canvasHeight;
  
      if (maxWidth / maxHeight > aspectRatio) {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * aspectRatio;
      } else {
        canvasWidth = maxWidth;
        canvasHeight = maxWidth / aspectRatio;
      }
  
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
  
      // Set decoy canvas dimensions to fill the screen
      decoyCanvas.width = window.innerWidth;
      decoyCanvas.height = window.innerHeight;
      paintDecoy(); // Draw the initial decoy frame
    };
  
    // Draw the decoy frame whenever the video is playing
    const startDecoyPainting = () => {
      if (playInterval) clearInterval(playInterval);
      playInterval = setInterval(paintDecoy, 1000 / 30); // drawing at 30fps
    };
  
    // Stop painting the decoy frame
    const stopDecoyPainting = () => {
      clearInterval(playInterval);
    };
  
    // Set up event listeners
    video.addEventListener('loadedmetadata', setCanvasDimensions);
    window.addEventListener('resize', setCanvasDimensions);
  
    // Start painting the decoy when the video starts playing
    video.addEventListener('play', startDecoyPainting);
    video.addEventListener('pause', stopDecoyPainting);
    video.addEventListener('ended', stopDecoyPainting);
  
    // Initial setup
    setCanvasDimensions();
  
    // Cleanup function
    return () => {
      video.removeEventListener('loadedmetadata', setCanvasDimensions);
      window.removeEventListener('resize', setCanvasDimensions);
      video.removeEventListener('play', startDecoyPainting);
      video.removeEventListener('pause', stopDecoyPainting);
      video.removeEventListener('ended', stopDecoyPainting);
      stopDecoyPainting(); // Clear the interval when the component unmounts
      cancelAnimationFrame(requestRef.current);
    };
  }, []); // Rerun the effect when videoPlaying changes
  

  useEffect(() => {
    if (currentCaption && preset !== 'default') {
      initializeLetterAnimations(currentCaption);
    }
  }, [currentCaption, preset]);
  

  const handleVideoFileChange = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    video.src = url;
  
    video.onloadedmetadata = () => {
      // Get video dimensions and calculate aspect ratio
      const videoAspectRatio = video.videoWidth / video.videoHeight;
    
      // Calculate canvas dimensions within the maximum bounds
      let canvasWidth, canvasHeight;
    
      const maxWidth = document.querySelector('.app').clientWidth * 0.85;
      const maxHeight = window.innerHeight * 0.8;
    
      if (maxWidth / maxHeight > videoAspectRatio) {
        // Canvas will be limited by height
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * videoAspectRatio;
      } else {
        // Canvas will be limited by width
        canvasWidth = maxWidth;
        canvasHeight = maxWidth / videoAspectRatio;
      }
    
      // Set canvas dimensions
      const canvas = canvasRef.current;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    };
    
  };

  const handleJsonFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      setCaptions(json.segments); // Set the caption segments
      setCurrentCaption(""); // Reset current caption
    };
  
    reader.readAsText(file);
  };
  

  const handlePresetChange = (event) => {
    setPreset(event.target.value);
    // Redraw the frame to update the caption style
    if (videoRef.current) {
      drawVideoFrame();
    }
  };
  
  return (
    <div className="app">
      <canvas ref={decoyCanvasRef} className="decoy" /> {/* Ambient canvas */}
      <video ref={videoRef} style={{ display: 'none' }} />
      <div className="canvas-container">
        <canvas ref={canvasRef} className="main-canvas" />
      </div>
      <div className="controls">
        <button id="playPause" onClick={handlePlayPause}>
          {videoPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className="file-controls">
        <input type="file" id="selectVideo" accept="video/*" onChange={handleVideoFileChange} />
        <input type="file" id="selectJson" accept="application/JSON" onChange={handleJsonFileChange} />
        <select id="selectPreset" onChange={handlePresetChange}>
          <option value="default">Default</option>
          <option value="preset1">Preset 1</option>
          <option value="preset2">Preset 2</option>
        </select>
      </div>
    </div>
  );
  
  
}

export default App;
