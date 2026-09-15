"use client";

import type { PointerEvent } from "react";
import { useRef, useState } from "react";

export function SignaturePad({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState(defaultValue);
  const drawing = useRef(false);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function save() {
    const canvas = canvasRef.current;
    if (canvas) setValue(canvas.toDataURL("image/png"));
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = point(event);
    context.beginPath();
    context.moveTo(x, y);
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;
    const { x, y } = point(event);
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.strokeStyle = "#0f172a";
    context.lineTo(x, y);
    context.stroke();
    save();
  }

  function stop() {
    drawing.current = false;
    save();
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setValue("");
  }

  return (
    <div>
      <label className="label">{label}</label>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-lg border border-slate-300 bg-white"
        width={720}
        height={220}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      <input name={name} type="hidden" value={value} />
      <button className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" onClick={clear} type="button">
        Clear signature
      </button>
    </div>
  );
}
