# 📦 File Compression & Decompression Portal

An interactive full-stack web app built with **React + Node.js + TypeScript** that allows users to upload files and either compress or decompress them using popular lossless algorithms.

---

## 🚀 Features

- 📁 Upload files of any type (text, images, PDFs, etc.)
- 🔄 Toggle between **Compression** and **Decompression** modes
- ⚙️ Compression Algorithms Supported:
  - Huffman Coding
  - Run-Length Encoding (RLE)
  - LZ77
- 📊 Real-time compression stats: original size, compressed size, compression ratio, time taken
- ⬇️ Download compressed/decompressed files
- ✨ Clean UI with TailwindCSS

---

## 🧠 How It Works

- In **Compression Mode**:
  - You upload a file
  - Choose a compression algorithm
  - The file is compressed and downloadable with a `.huff`, `.rle`, or `.lz77` extension
- In **Decompression Mode**:
  - You upload a previously compressed file
  - The system auto-detects the algorithm based on its extension
  - The file is decompressed and restored to its original format

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/adithya-iitr/compression-and-decompression.git
```
Install typescript if not already, using the following:
```bash
npm install -g typescript --save-dev
```
In the root directory run the following commands
```bash
npm run build
npm run start
```
The application will start at port 8000 and be ready to use