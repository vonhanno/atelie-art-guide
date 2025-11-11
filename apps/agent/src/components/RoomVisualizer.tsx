"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Line } from "react-konva";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, RotateCw, ZoomIn, ZoomOut, Grid } from "lucide-react";
import useImage from "use-image";

interface RoomVisualizerProps {
  artwork: any;
  roomImage: string | null;
}

export function RoomVisualizer({ artwork, roomImage }: RoomVisualizerProps) {
  const [artworkImage] = useImage(artwork.imageUrls?.[0] || "");
  const [backgroundImage] = useImage(roomImage || "/placeholder-room.jpg");
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 400 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  const aspectRatio = artworkImage ? artworkImage.width / artworkImage.height : 1;

  useEffect(() => {
    if (imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [artworkImage]);

  const handleDragEnd = (e: any) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    if (!imageRef.current) return;

    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (lockAspectRatio) {
      const scale = Math.min(scaleX, scaleY);
      node.scaleX(scale);
      node.scaleY(scale);
    }

    setSize({
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(50, node.height() * scaleY),
    });
    setRotation(node.rotation());
    setPosition({
      x: node.x(),
      y: node.y(),
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setSize((prev) => ({
      width: prev.width * 1.1,
      height: prev.height * 1.1,
    }));
  };

  const handleZoomOut = () => {
    setSize((prev) => ({
      width: prev.width * 0.9,
      height: prev.height * 0.9,
    }));
  };

  const handleDownload = () => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: "image/png",
    });

    const link = document.createElement("a");
    link.download = `${artwork.title}-in-room.png`;
    link.href = dataURL;
    link.click();
  };

  const stageWidth = 800;
  const stageHeight = 600;

  return (
    <Card>
      <CardHeader>
        <CardTitle>View in Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out
          </Button>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="grid"
              checked={showGrid}
              onCheckedChange={(checked) => setShowGrid(!!checked)}
            />
            <label htmlFor="grid" className="text-sm cursor-pointer flex items-center">
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aspect"
              checked={lockAspectRatio}
              onCheckedChange={(checked) => setLockAspectRatio(!!checked)}
            />
            <label htmlFor="aspect" className="text-sm cursor-pointer">
              Lock Aspect Ratio
            </label>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Opacity Slider */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <Slider
            value={[opacity]}
            onValueChange={(v) => setOpacity(v[0])}
            min={0}
            max={1}
            step={0.01}
          />
        </div>

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden bg-muted">
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                transformerRef.current?.nodes([]);
              }
            }}
          >
            <Layer>
              {/* Background Room Image */}
              {backgroundImage && (
                <KonvaImage
                  image={backgroundImage}
                  width={stageWidth}
                  height={stageHeight}
                  x={0}
                  y={0}
                />
              )}

              {/* Grid Overlay */}
              {showGrid && (
                <>
                  {Array.from({ length: 11 }).map((_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                      <Line
                        points={[(stageWidth / 10) * i, 0, (stageWidth / 10) * i, stageHeight]}
                        stroke="#ccc"
                        strokeWidth={1}
                        opacity={0.5}
                      />
                      <Line
                        points={[0, (stageHeight / 10) * i, stageWidth, (stageHeight / 10) * i]}
                        stroke="#ccc"
                        strokeWidth={1}
                        opacity={0.5}
                      />
                    </React.Fragment>
                  ))}
                </>
              )}

              {/* Artwork Image */}
              {artworkImage && (
                <>
                  <KonvaImage
                    ref={imageRef}
                    image={artworkImage}
                    x={position.x}
                    y={position.y}
                    width={size.width}
                    height={size.height}
                    rotation={rotation}
                    opacity={opacity}
                    draggable
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      transformerRef.current?.nodes([imageRef.current]);
                    }}
                  />
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (lockAspectRatio) {
                        const scale = Math.min(
                          newBox.width / oldBox.width,
                          newBox.height / oldBox.height
                        );
                        return {
                          ...newBox,
                          width: oldBox.width * scale,
                          height: oldBox.height * scale,
                        };
                      }
                      return newBox;
                    }}
                  />
                </>
              )}
            </Layer>
          </Stage>
        </div>

        <p className="text-sm text-muted-foreground">
          Drag the artwork to reposition, use corners to resize, and rotate with the rotate button.
        </p>
      </CardContent>
    </Card>
  );
}

