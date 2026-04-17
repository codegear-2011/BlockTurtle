/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Code2, 
  Layout, 
  Palette, 
  Box, 
  Zap,
  MousePointer2,
  Settings2,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Terminal,
  Blocks,
  Pen,
  Eraser
} from 'lucide-react';

// --- Python Transpiler Logic ---

/**
 * A simplified Python to JavaScript transpiler for educational purposes.
 * Handles basic loops, function calls, and indentation.
 */
const transpilePythonToJs = (pythonCode: string): string => {
  const lines = pythonCode.split('\n');
  let jsCode = '';
  let indentLevel = 0;

  const mapping: Record<string, string> = {
    'move_steps': 'moveSteps',
    'turn_right': 'turnRight',
    'turn_left': 'turnLeft',
    'say': 'say',
    'wait': 'await wait',
    'pen_down': 'penDown',
    'pen_up': 'penUp',
    'pen_clear': 'penClear',
    'set_pen_color': 'setPenColor',
  };

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    // Handle indentation closing
    const currentIndent = line.search(/\S/);
    if (currentIndent !== -1 && currentIndent < indentLevel * 4) {
      while (indentLevel * 4 > currentIndent) {
        jsCode += '}\n';
        indentLevel--;
      }
    }

    // Handle Control Structures
    if (trimmedLine.startsWith('for ') && trimmedLine.endsWith(':')) {
      const match = trimmedLine.match(/for (\w+) in range\((\d+)\):/);
      if (match) {
        const [, varName, count] = match;
        jsCode += `for (let ${varName} = 0; ${varName} < ${count}; ${varName}++) {\n`;
        indentLevel++;
      }
      return;
    }

    if (trimmedLine.startsWith('while ') && trimmedLine.endsWith(':')) {
      const condition = trimmedLine.slice(6, -1).replace('True', 'true').replace('False', 'false');
      jsCode += `while (${condition}) {\n`;
      indentLevel++;
      return;
    }

    if (trimmedLine.startsWith('if ') && trimmedLine.endsWith(':')) {
      const condition = trimmedLine.slice(3, -1);
      jsCode += `if (${condition}) {\n`;
      indentLevel++;
      return;
    }

    // Handle Function Calls
    let processedLine = trimmedLine;
    Object.keys(mapping).forEach(pyFunc => {
      const jsFunc = mapping[pyFunc];
      const regex = new RegExp(`${pyFunc}\\(`, 'g');
      processedLine = processedLine.replace(regex, `${jsFunc}(`);
    });

    if (processedLine) {
      jsCode += processedLine + (processedLine.endsWith('{') ? '' : ';\n');
    }
  });

  // Close remaining blocks
  while (indentLevel > 0) {
    jsCode += '}\n';
    indentLevel--;
  }

  return jsCode;
};

// --- Blockly Custom Blocks Definition ---
// ... (rest of the definitions)

const defineCustomBlocks = () => {
  // Motion: Move Steps
  Blockly.Blocks['motion_movesteps'] = {
    init: function() {
      this.appendValueInput('STEPS')
          .setCheck('Number')
          .appendField('move');
      this.appendDummyInput()
          .appendField('steps');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
      this.setTooltip('Move forward by a number of steps');
    }
  };

  javascriptGenerator.forBlock['motion_movesteps'] = function(block: any) {
    const steps = javascriptGenerator.valueToCode(block, 'STEPS', Order.ATOMIC) || '0';
    return `moveSteps(${steps});\n`;
  };

  // Motion: Turn Right
  Blockly.Blocks['motion_turnright'] = {
    init: function() {
      this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('turn');
      this.appendDummyInput()
          .appendField('degrees ↻');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
    }
  };

  javascriptGenerator.forBlock['motion_turnright'] = function(block: any) {
    const degrees = javascriptGenerator.valueToCode(block, 'DEGREES', Order.ATOMIC) || '0';
    return `turnRight(${degrees});\n`;
  };

  // Motion: Turn Left
  Blockly.Blocks['motion_turnleft'] = {
    init: function() {
      this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('turn');
      this.appendDummyInput()
          .appendField('degrees ↺');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(225);
    }
  };

  javascriptGenerator.forBlock['motion_turnleft'] = function(block: any) {
    const degrees = javascriptGenerator.valueToCode(block, 'DEGREES', Order.ATOMIC) || '0';
    return `turnLeft(${degrees});\n`;
  };

  // Events: When Green Flag Clicked
  Blockly.Blocks['event_whenflagclicked'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('when 🚩 clicked');
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Starts the script when the green flag is clicked');
    }
  };

  javascriptGenerator.forBlock['event_whenflagclicked'] = function(block: any) {
    return ''; // This is a header block, handled by entry point detection
  };

  // Looks: Say
  Blockly.Blocks['looks_say'] = {
    init: function() {
      this.appendValueInput('TEXT')
          .setCheck('String')
          .appendField('say');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    }
  };

  javascriptGenerator.forBlock['looks_say'] = function(block: any) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''";
    return `say(${text});\n`;
  };

  // Control: Wait
  Blockly.Blocks['control_wait'] = {
    init: function() {
      this.appendValueInput('SECONDS')
          .setCheck('Number')
          .appendField('wait');
      this.appendDummyInput()
          .appendField('seconds');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
    }
  };

  javascriptGenerator.forBlock['control_wait'] = function(block: any) {
    const seconds = javascriptGenerator.valueToCode(block, 'SECONDS', Order.ATOMIC) || '0';
    return `await wait(${seconds});\n`;
  };

  // Pen: Pen Down
  Blockly.Blocks['pen_pendown'] = {
    init: function() {
      this.appendDummyInput().appendField('pen down');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  javascriptGenerator.forBlock['pen_pendown'] = function() {
    return 'penDown();\n';
  };

  // Pen: Pen Up
  Blockly.Blocks['pen_penup'] = {
    init: function() {
      this.appendDummyInput().appendField('pen up');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  javascriptGenerator.forBlock['pen_penup'] = function() {
    return 'penUp();\n';
  };

  // Pen: Clear
  Blockly.Blocks['pen_clear'] = {
    init: function() {
      this.appendDummyInput().appendField('erase all');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  javascriptGenerator.forBlock['pen_clear'] = function() {
    return 'penClear();\n';
  };

  // Pen: Set Color
  Blockly.Blocks['pen_setcolor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('set pen color to')
          .appendField(new Blockly.FieldColour('#4C97FF'), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  javascriptGenerator.forBlock['pen_setcolor'] = function(block: any) {
    const color = block.getFieldValue('COLOR');
    return `setPenColor('${color}');\n`;
  };
};

// --- Application Component ---

export default function App() {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [spriteState, setSpriteState] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    message: '',
    size: 100,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activity, setActivity] = useState<string[]>([]);
  const [penState, setPenState] = useState({
    isDown: false,
    color: '#4C97FF',
    size: 2,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editorMode, setEditorMode] = useState<'blocks' | 'python'>('blocks');
  const [pythonCode, setPythonCode] = useState<string>(
    '# Welcome to Python Mode!\n' +
    '# Try these commands:\n' +
    '# move_steps(50)\n' +
    '# turn_right(90)\n' +
    '# say("Hello from Python!")\n' +
    '# wait(1)\n\n' +
    'for i in range(4):\n' +
    '    move_steps(100)\n' +
    '    turn_right(90)\n' +
    '    wait(0.5)\n' +
    'say("Done!")'
  );

  // Initialize Blockly
  useEffect(() => {
    if (!blocklyDivRef.current) return;

    defineCustomBlocks();

    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Motion',
          colour: '#4C97FF',
          contents: [
            { kind: 'block', type: 'motion_movesteps', inputs: { STEPS: { shadow: { type: 'math_number', fields: { NUM: 10 } } } } },
            { kind: 'block', type: 'motion_turnright', inputs: { DEGREES: { shadow: { type: 'math_number', fields: { NUM: 15 } } } } },
            { kind: 'block', type: 'motion_turnleft', inputs: { DEGREES: { shadow: { type: 'math_number', fields: { NUM: 15 } } } } },
          ],
        },
        {
          kind: 'category',
          name: 'Looks',
          colour: '#9966FF',
          contents: [
            { kind: 'block', type: 'looks_say', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'Hello!' } } } } },
          ],
        },
        {
          kind: 'category',
          name: 'Events',
          colour: '#FFBF00',
          contents: [
            { kind: 'block', type: 'event_whenflagclicked' },
          ],
        },
        {
          kind: 'category',
          name: 'Control',
          colour: '#FFAB19',
          contents: [
            { kind: 'block', type: 'control_wait', inputs: { SECONDS: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } },
            { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 } } } } },
          ],
        },
        {
          kind: 'category',
          name: 'Pen',
          colour: '#00B188',
          contents: [
            { kind: 'block', type: 'pen_pendown' },
            { kind: 'block', type: 'pen_penup' },
            { kind: 'block', type: 'pen_clear' },
            { kind: 'block', type: 'pen_setcolor' },
          ],
        },
      ],
    };

    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: 1, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
      theme: Blockly.Themes.Classic,
    });

    // Resize handler
    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      workspaceRef.current?.dispose();
    };
  }, []);

  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Code Execution Logic
  const runCode = async () => {
    setIsRunning(true);
    setSpriteState(prev => ({ ...prev, message: '' }));

    let codeToRun = '';
    
    if (editorMode === 'blocks') {
      if (!workspaceRef.current) return;
      // Update generated code display
      const currentCode = javascriptGenerator.workspaceToCode(workspaceRef.current);
      setGeneratedCode(currentCode);

      // Find all "when flag clicked" blocks
      const topBlocks = workspaceRef.current.getTopBlocks(false);
      const flagBlocks = topBlocks.filter(b => b.type === 'event_whenflagclicked');

      if (flagBlocks.length === 0) {
        setIsRunning(false);
        return;
      }

      for (const block of flagBlocks) {
        const nextBlock = block.getNextBlock();
        if (nextBlock) {
          codeToRun += javascriptGenerator.blockToCode(nextBlock);
        }
      }
    } else {
      codeToRun = transpilePythonToJs(pythonCode);
      setGeneratedCode(codeToRun);
    }

    if (!codeToRun) {
      setIsRunning(false);
      return;
    }

    // Execution environment functions
    // Using a local state reference to avoid stale closures in the AsyncFunction
    let currentX = spriteState.x;
    let currentY = spriteState.y;
    let currentRotation = spriteState.rotation;
    let isPenDown = penState.isDown;
    let penColor = penState.color;

    const moveSteps = (steps: number) => {
      const rad = (currentRotation * Math.PI) / 180;
      const newX = currentX + steps * Math.cos(rad);
      const newY = currentY - steps * Math.sin(rad); // Flip Y for canvas coords
      
      if (isPenDown && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Normalizing coordinates to center of canvas
          const cx = canvasRef.current.width / 2;
          const cy = canvasRef.current.height / 2;
          
          ctx.beginPath();
          ctx.strokeStyle = penColor;
          ctx.lineWidth = penState.size;
          ctx.lineCap = 'round';
          ctx.moveTo(cx + currentX, cy + currentY);
          ctx.lineTo(cx + newX, cy + newY);
          ctx.stroke();
        }
      }

      currentX = newX;
      currentY = newY;
      setSpriteState(s => ({ ...s, x: currentX, y: currentY }));
      setActivity(prev => [`> moved ${steps} steps`, ...prev.slice(0, 10)]);
    };

    const turnRight = (deg: number) => {
      currentRotation += deg;
      setSpriteState(s => ({ ...s, rotation: currentRotation }));
    };

    const turnLeft = (deg: number) => {
      currentRotation -= deg;
      setSpriteState(s => ({ ...s, rotation: currentRotation }));
    };

    const say = (text: string) => {
      setSpriteState(s => ({ ...s, message: text }));
      setActivity(prev => [`> said: "${text}"`, ...prev.slice(0, 10)]);
    };

    const wait = (seconds: number) => {
      setActivity(prev => [`> waiting ${seconds}s...`, ...prev.slice(0, 10)]);
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    };

    const penDown = () => {
      isPenDown = true;
      setPenState(p => ({ ...p, isDown: true }));
      setActivity(prev => ['> pen down', ...prev.slice(0, 10)]);
    };

    const penUp = () => {
      isPenDown = false;
      setPenState(p => ({ ...p, isDown: false }));
      setActivity(prev => ['> pen up', ...prev.slice(0, 10)]);
    };

    const penClear = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      setActivity(prev => ['> erased all', ...prev.slice(0, 10)]);
    };

    const setPenColor = (color: string) => {
      penColor = color;
      setPenState(p => ({ ...p, color }));
      setActivity(prev => [`> pen color: ${color}`, ...prev.slice(0, 10)]);
    };

    try {
      setActivity(prev => ['> starting execution...', ...prev.slice(0, 10)]);
      // Run the code as an async function
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const runner = new AsyncFunction('moveSteps', 'turnRight', 'turnLeft', 'say', 'wait', 'penDown', 'penUp', 'penClear', 'setPenColor', codeToRun);
      await runner(moveSteps, turnRight, turnLeft, say, wait, penDown, penUp, penClear, setPenColor);
    } catch (e) {
      console.error('Code Execution Error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const resetSprite = () => {
    setSpriteState({
      x: 0,
      y: 0,
      rotation: 0,
      message: '',
      size: 100,
    });
    setPenState({
      isDown: false,
      color: '#4C97FF',
      size: 2,
    });
  };

  const penClear = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setActivity(['> stage cleared']);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shadow-sm z-50">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">BlocklyScratch</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Professional Edition</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full p-1.5 px-4 gap-4 shadow-inner border border-gray-200">
          <button 
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-bold text-sm ${
              isRunning 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <Play size={18} fill="currentColor" />
            GO
          </button>
          <button 
            onClick={() => setIsRunning(false)}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-red-200 transition-all duration-300 font-bold text-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            <Square size={16} fill="currentColor" />
            STOP
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (workspaceRef.current) {
                setGeneratedCode(javascriptGenerator.workspaceToCode(workspaceRef.current));
                setShowCode(!showCode);
              }
            }}
            className={`p-2.5 rounded-full transition-colors border border-gray-100 ${showCode ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
            title="Toggle Code View"
          >
            <Code2 size={20} />
          </button>
          <button 
            onClick={() => {
              penClear();
              resetSprite();
            }}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors border border-gray-100"
            title="Reset Stage"
          >
            <RotateCcw size={20} />
          </button>
          <div className="h-8 w-[1px] bg-gray-200 mx-2" />
          <button className="p-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Blockly Workspace */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out relative ${isSidebarOpen ? 'mr-[420px]' : 'mr-0'}`}>
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button 
                onClick={() => setEditorMode('blocks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${editorMode === 'blocks' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
              >
                <Blocks size={16} />
                <span className="text-sm">Blocks</span>
              </button>
              <button 
                onClick={() => setEditorMode('python')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${editorMode === 'python' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
              >
                <Terminal size={16} />
                <span className="text-sm">Python</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-gray-200 mx-1" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-gray-400">
                <Palette size={16} />
                <span className="text-sm font-medium">Costumes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-gray-400">
                <Zap size={16} />
                <span className="text-sm font-medium">Sounds</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div 
              ref={blocklyDivRef} 
              className={`flex-1 w-full bg-[#f0f0f0] outline-none transition-opacity duration-300 ${editorMode === 'blocks' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none absolute inset-0'}`} 
            />
            {editorMode === 'python' && (
              <div className="flex-1 w-full bg-[#1e1e1e] overflow-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                  <div className="flex items-center gap-2 text-[#8b8b8b]">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">main.py</span>
                  </div>
                  <div className="text-[10px] text-[#555] font-mono">Python 3.10</div>
                </div>
                <div className="flex-1 relative">
                  <Editor
                    value={pythonCode}
                    onValueChange={code => setPythonCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
                    padding={24}
                    style={{
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      fontSize: 14,
                      minHeight: '100%',
                      color: '#d4d4d4',
                      backgroundColor: 'transparent',
                    }}
                    textareaClassName="outline-none focus:ring-0"
                    preClassName="m-0"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-[60] p-2 bg-white border border-gray-200 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all text-gray-600`}
          >
            {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Right Column: Stage & Sprite Config */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: 420 }} 
              animate={{ x: 0 }} 
              exit={{ x: 420 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[420px] fixed right-0 top-16 bottom-0 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-40"
            >
              {/* Stage Area */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Box size={18} className="text-blue-600" />
                    <h2 className="font-bold text-sm tracking-wide text-gray-600 uppercase">Stage View</h2>
                  </div>
                  <button 
                    onClick={() => {
                      if (workspaceRef.current) {
                        setGeneratedCode(javascriptGenerator.workspaceToCode(workspaceRef.current));
                        setShowCode(!showCode);
                      }
                    }}
                    className={`text-gray-400 hover:text-gray-600 transition-colors ${showCode ? 'text-blue-500' : ''}`}
                    title="View Source"
                  >
                    <Code2 size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Maximize2 size={18} />
                  </button>
                </div>
                
                <div className="relative aspect-[4/3] bg-gray-50 rounded-3xl border-4 border-white shadow-inner overflow-hidden flex items-center justify-center group outline outline-gray-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                  {/* Drawing Canvas */}
                  <canvas 
                    ref={canvasRef}
                    width={800} 
                    height={600}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-5 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="border-r border-gray-900 h-full" />
                    ))}
                  </div>
                  <div className="absolute inset-0 grid grid-rows-9 gap-0 opacity-5 pointer-events-none">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border-b border-gray-900 w-full" />
                    ))}
                  </div>

                  {/* Generated Code Overlay */}
                  <AnimatePresence>
                    {showCode && (
                      <motion.div 
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-40 bg-white/80 p-6 overflow-auto"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Compiled JavaScript</h3>
                          <button onClick={() => setShowCode(false)} className="text-gray-400 hover:text-gray-900">
                            <Square size={14} className="rotate-45" />
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-blue-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 whitespace-pre-wrap">
                          {generatedCode || '// No code generated yet'}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Stage Sprite */}
                  <motion.div 
                    animate={{ 
                      x: spriteState.x, 
                      y: spriteState.y, 
                      rotate: spriteState.rotation,
                      scale: spriteState.size / 100
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="relative cursor-grab active:cursor-grabbing"
                  >
                    {/* Speech Bubble */}
                    <AnimatePresence>
                      {spriteState.message && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-xl border border-gray-200 whitespace-nowrap min-w-[60px] text-center font-medium after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white"
                        >
                          {spriteState.message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sprite Graphic (Professional Icon) */}
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      <MousePointer2 size={32} />
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30" />
                    </div>
                  </motion.div>
                  
                  {/* Origin Indicator */}
                  <div className="absolute w-2 h-2 bg-gray-300 rounded-full opacity-20" />
                </div>
              </div>

              {/* Console / Sprite Settings */}
              <div className="flex-1 flex flex-col p-6 pt-0 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings2 size={18} className="text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-500 tracking-wide uppercase">Sprite Config</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Position X</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono text-blue-600 font-medium">
                        {Math.round(spriteState.x)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Position Y</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono text-blue-600 font-medium">
                        {Math.round(spriteState.y)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Direction</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono text-gray-700 font-medium flex items-center justify-between">
                        {Math.round(spriteState.rotation)}°
                        <RotateCcw size={12} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scale</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono text-gray-700 font-medium">
                        {spriteState.size}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-5 bg-gray-900 rounded-2x border border-gray-800 shadow-xl flex flex-col overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search size={48} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-bold text-xs text-gray-400 tracking-wider uppercase">Live Activity</h3>
                  </div>
                  <div className="flex-1 font-mono text-xs text-gray-400 space-y-2 overflow-y-auto">
                    <p className="text-green-400/80">$ system.init()</p>
                    {activity.map((line, i) => (
                      <p key={i} className={i === 0 ? 'text-blue-400 animate-pulse' : 'text-gray-500'}>{line}</p>
                    ))}
                    {activity.length === 0 && <p className="text-gray-500 italic">// Waiting for input...</p>}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between px-6">
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">Engine v1.0.4</span>
                <span className="text-[10px] font-bold text-blue-400/50 hover:text-blue-400 cursor-pointer transition-colors uppercase">Documentation</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Global styles for Blockly */}
      <style>{`
        .blocklyMainBackground {
          stroke: none !important;
        }
        .blocklyToolboxDiv {
          background-color: white !important;
          border-right: 1px solid #e5e7eb !important;
          padding: 10px 0 !important;
          width: 140px !important;
        }
        .blocklyTreeRow {
          padding: 12px 16px !important;
          height: auto !important;
          line-height: normal !important;
          margin: 4px 8px !important;
          border-radius: 8px !important;
          transition: all 0.2s !important;
        }
        .blocklyTreeRow:hover {
          background-color: #f3f4f6 !important;
        }
        .blocklyTreeSelected {
          background-color: #eff6ff !important;
          color: #2563eb !important;
        }
        .blocklyTreeIcon {
          display: none !important;
        }
        .blocklyTreeLabel {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          letter-spacing: -0.01em !important;
        }
        .blocklyFlyoutBackground {
          fill: #f9fafb !important;
          fill-opacity: 0.8 !important;
        }
        .blocklySvg {
          background-color: transparent !important;
        }
        .blocklyScrollbarHandle {
          fill: #d1d5db !important;
          fill-opacity: 0.5 !important;
        }
      `}</style>
    </div>
  );
}
