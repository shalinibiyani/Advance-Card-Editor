import React, { forwardRef } from "react";
import { Text as KonvaText } from "react-konva";
import Konva from "konva";
import { ElementBase } from "../../store/useEditorStore";

type Props = {
  el: ElementBase;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
};

const ElementText = forwardRef<Konva.Text | null, Props>(({ 
  el, 
  onClick, 
  onDblClick 
}, ref) => {
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onClick) {
      onClick(e);
    }
  };

  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onDblClick) {
      onDblClick(e);
    }
  };

  const getFontStyles = () => {
    const styles: any = {
      fontSize: el.fontSize || 16,
      fontFamily: 'Arial, sans-serif',
      fill: el.fill || "#000000",
    };

    if (el.fontStyle) {
      if (el.fontStyle.includes('bold')) styles.fontWeight = 'bold';
      if (el.fontStyle.includes('italic')) styles.fontStyle = 'italic';
      if (el.fontStyle.includes('underline')) {
        styles.textDecoration = 'underline';
      }
    }

    return styles;
  };

  return (
    <KonvaText
      id={el.id}
      ref={ref}
      x={el.x}
      y={el.y}
      text={el.text || "Text"}
      {...getFontStyles()}
      rotation={el.rotation || 0}
      draggable
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      opacity={el.opacity ?? 1}
      // Better interaction
      perfectDrawEnabled={false}
      listening={true}
      hitStrokeWidth={10}
      padding={5}
    />
  );
});

ElementText.displayName = "ElementText";
export default ElementText;