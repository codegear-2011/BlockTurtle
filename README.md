# 🐢 BlockTurtle

**BlockTurtle** is a modern visual programming environment inspired by **MSWLogo and Scratch**, built using **React + Blockly + Python** transpilation.

It allows users to:

- Drag & drop blocks to create programs

- Write Python-like code

- See real-time execution with a turtle graphics system



---

🚀 Features

🎯 Dual Editor Mode

🧱 Blocks Mode – Drag-and-drop programming using Blockly

🐍 Python Mode – Write simple Python code and auto-convert to JavaScript



---

🧠 Smart Execution Engine

Async execution support (wait)

Live sprite movement

Activity log tracking

Safe sandboxed execution



---

🎨 Turtle Graphics System

Move, rotate, and draw like classic Logo

Pen controls:

Pen up / down

Change color

Clear canvas




---

🧩 Custom Blockly Blocks

Motion (move, turn)

Looks (say)

Control (wait, loops)

Pen tools



---

⚡ Python → JavaScript Transpiler

A lightweight transpiler that supports:

for loops (range)

while loops

if conditions

Function mapping (e.g. move() → moveSteps())



---

🛠️ Tech Stack

⚛️ React (UI)

🧱 Blockly (Visual programming)

🧠 Custom JS execution engine

🎨 Canvas API (drawing)

✨ Framer Motion (animations)

🖍️ PrismJS (code highlighting)



---

📦 Installation

git clone https://github.com/your-username/blockturtle.git
cd blockturtle
npm install
npm run dev


---

🧪 Example (Python Mode)

pendown()
for i in range(4):
    move(100)
    turnright(90)
    wait(0.5)

say("Done!")


---

▶️ How It Works

1. User writes code (Blocks or Python)


2. Python gets transpiled → JavaScript


3. JS runs inside async sandbox


4. Functions control the sprite + canvas




---

🎮 Controls

Action	Description

▶ GO	Run code
⛔ STOP	Stop execution
🔄 Reset	Clear canvas & reset sprite
💻 Code	Toggle JS output



---

📁 Project Structure

/src
 ├── App.tsx        # Main application
 ├── blocks/        # Custom Blockly blocks
 ├── utils/         # Transpiler logic
 ├── components/    # UI components


---

⚠️ Limitations

Python support is basic (educational purpose)

No variable system (yet)

No user-defined functions

Limited Blockly blocks



---

🔮 Future Plans

✅ Variables & expressions

✅ Function blocks

✅ Save/load projects

✅ Multiplayer coding (collab mode 😏)

✅ Export as JS project

✅ Mobile support



---

🤝 Contributing

Pull requests are welcome!

# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature


---

📜 License

Apache License 2.0


---

💡 Inspiration

Scratch

MSWLogo

Blockly



---

👨‍💻 Author

CodeGear Pvt Ltd


