import React, { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

export interface AnnotationData {
  id: string;
  boxPos: Position;
  anchorPos: Position;
  content: string;
}

interface DraggableAnnotationProps {
  data: AnnotationData;
  onDelete?: (id: string) => void;
  onDuplicate?: (data: Omit<AnnotationData, 'id'>) => void;
  onUpdate?: (id: string, newData: Partial<AnnotationData>) => void;
}

const LOGIC_TEMPLATES = [
  { 
    label: "👆 核心交互", 
    text: "**交互逻辑：**\n1. 触发操作：[点击 / 悬停 / 输入]\n2. 前置校验：[是否登录 / 表单验证]\n3. 界面反馈：[显示 Loading / 禁用按钮]\n4. 结果响应：[跳转页面 / 弹出 Toast]" 
  },
  { 
    label: "💾 数据逻辑", 
    text: "**数据规则：**\n1. 接口地址：`GET /api/resource`\n2. 加载机制：[预加载 / 懒加载 / 分页]\n3. 缓存策略：[无缓存 / LocalStorage 5分钟]\n4. 字段映射：`ViewField` <- `ApiField`" 
  },
  { 
    label: "🔀 状态判定", 
    text: "**状态流转：**\nIF [变量] == [值 A]：\n  显示：[组件状态 A (高亮)]\nELSE IF [变量] == [值 B]：\n  显示：[组件状态 B (置灰)]\nELSE：\n  操作：[隐藏入口]" 
  },
  { 
    label: "⚠️ 异常处理", 
    text: "**异常机制：**\n1. 网络超时：[自动重试 3 次 / 显示缺省图]\n2. 数据为空：[显示占位符 / 空状态插画]\n3. 报错提示：[Toast: '具体错误信息']" 
  }
];

export const DraggableAnnotation: React.FC<DraggableAnnotationProps> = ({ 
  data,
  onDelete,
  onDuplicate,
  onUpdate
}) => {
  const [boxPos, setBoxPos] = useState<Position>(data.boxPos);
  const [anchorPos, setAnchorPos] = useState<Position>(data.anchorPos);
  const [content, setContent] = useState(data.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Drag state
  const [dragTarget, setDragTarget] = useState<'box' | 'anchor' | null>(null);
  
  // We use refs to store the initial positions when drag starts to calculate deltas
  const dragStartMouse = useRef<Position>({ x: 0, y: 0 });
  const dragStartElement = useRef<Position>({ x: 0, y: 0 });

  // Sync local state if props change externally (though typically we drive from local during interaction)
  useEffect(() => {
    setBoxPos(data.boxPos);
    setAnchorPos(data.anchorPos);
    setContent(data.content);
  }, [data]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragTarget) return;

      // Calculate delta based on Page coordinates (document flow) to handle scrolling correctly
      const deltaX = e.pageX - dragStartMouse.current.x;
      const deltaY = e.pageY - dragStartMouse.current.y;

      if (dragTarget === 'box') {
        setBoxPos({
          x: dragStartElement.current.x + deltaX,
          y: dragStartElement.current.y + deltaY
        });
      } else if (dragTarget === 'anchor') {
        setAnchorPos({
          x: dragStartElement.current.x + deltaX,
          y: dragStartElement.current.y + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      if (dragTarget && onUpdate) {
        // Persist the new position to parent state
        onUpdate(data.id, {
            boxPos: dragTarget === 'box' ? boxPos : data.boxPos,
            anchorPos: dragTarget === 'anchor' ? anchorPos : data.anchorPos,
        });
      }
      setDragTarget(null);
    };

    if (dragTarget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragTarget, boxPos, anchorPos, data, onUpdate]);

  const startDragBox = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    setDragTarget('box');
    dragStartMouse.current = { x: e.pageX, y: e.pageY };
    dragStartElement.current = { x: boxPos.x, y: boxPos.y };
    setShowTemplates(false);
  };

  const startDragAnchor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragTarget('anchor');
    dragStartMouse.current = { x: e.pageX, y: e.pageY };
    dragStartElement.current = { x: anchorPos.x, y: anchorPos.y };
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
        onDuplicate({
            boxPos,
            anchorPos,
            content
        });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
        onDelete(data.id);
    }
  };

  const handleContentBlur = () => {
      setIsEditing(false);
      if (onUpdate && content !== data.content) {
          onUpdate(data.id, { content });
      }
  };

  const handleTemplateSelect = (text: string) => {
      setContent(text);
      setShowTemplates(false);
      // Immediately save when template is selected
      if (onUpdate) {
          onUpdate(data.id, { content: text });
      }
  };

  // Calculate Bezier Curve
  const getPath = () => {
    const startX = anchorPos.x;
    const startY = anchorPos.y;
    // Connect to the top-left of box
    const endX = boxPos.x + 20; 
    const endY = boxPos.y; 

    // Control point
    const cpX = startX;
    const cpY = endY;

    return `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
  };

  return (
    <>
      {/* 1. SVG Layer for Smart Connection - Absolute positioning relative to container */}
      <svg className="absolute inset-0 z-[9990] pointer-events-none overflow-visible w-full h-full">
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                <path d="M0,0 L0,10 L10,5 z" fill="#06b6d4" />
            </marker>
        </defs>
        <path 
          d={getPath()} 
          fill="none" 
          stroke="#06b6d4" 
          strokeWidth="2" 
          strokeDasharray="4 4"
          className="drop-shadow-sm opacity-60"
        />
        <circle cx={anchorPos.x} cy={anchorPos.y} r="3" fill="#06b6d4" className="animate-ping opacity-30" />
      </svg>

      {/* 2. Draggable Anchor Point - Absolute */}
      <div 
        className="absolute z-[9992] w-6 h-6 -ml-3 -mt-3 cursor-crosshair flex items-center justify-center group pointer-events-auto"
        style={{ left: anchorPos.x, top: anchorPos.y }}
        onMouseDown={startDragAnchor}
      >
        <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-lg ring-2 ring-white/50 group-hover:scale-125 transition-transform"></div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
            拖拽锚点
        </div>
      </div>

      {/* 3. Draggable Info Box - Absolute */}
      <div 
        className={`absolute z-[9991] flex flex-col w-72 bg-[#1e293b]/95 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl transition-shadow pointer-events-auto ${isEditing ? 'ring-2 ring-cyan-500' : 'hover:shadow-cyan-500/20'}`}
        style={{ left: boxPos.x, top: boxPos.y }}
      >
        {/* Header Handle */}
        <div 
            className="h-8 bg-slate-800/80 rounded-t-lg flex items-center justify-between px-3 cursor-move select-none border-b border-white/5 group"
            onMouseDown={startDragBox}
        >
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">产品标注</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={handleDuplicate}
                    className="p-1 hover:bg-white/10 rounded text-cyan-300 hover:text-white"
                    title="复制标注"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <button 
                    onClick={handleDelete}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-200"
                    title="删除"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-px h-3 bg-white/10 mx-1"></div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
                    className="text-[10px] bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-white px-2 py-0.5 rounded transition-all"
                >
                    {showTemplates ? '关闭' : '+ 模板'}
                </button>
            </div>
        </div>

        {/* Templates Menu */}
        {showTemplates && (
            <div className="absolute top-9 left-0 w-full bg-slate-800 border border-slate-600 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in">
                {LOGIC_TEMPLATES.map((t, i) => (
                    <button 
                        key={i}
                        onClick={() => handleTemplateSelect(t.text)}
                        className="w-full text-left px-3 py-2 text-[10px] text-slate-300 hover:bg-slate-700 border-b border-slate-700/50 last:border-0"
                    >
                        <span className="font-bold text-cyan-400 block mb-0.5">{t.label}</span>
                        <span className="opacity-70 truncate block">{t.text.substring(0, 30)}...</span>
                    </button>
                ))}
            </div>
        )}

        {/* Content Area */}
        {isEditing ? (
          <textarea
            className="w-full h-32 bg-transparent text-xs text-slate-200 p-3 focus:outline-none font-mono resize-none leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            autoFocus
            spellCheck={false}
            placeholder="输入技术实现细节，交互逻辑或数据规则..."
          />
        ) : (
          <div 
            className="w-full min-h-[80px] text-xs text-slate-300 p-3 font-mono cursor-text whitespace-pre-wrap leading-relaxed hover:bg-white/5 transition-colors rounded-b-lg"
            onClick={() => setIsEditing(true)}
          >
            {content ? (
                // Simple highlighting
                content.split('\n').map((line, i) => {
                     if (line.includes('**')) {
                         return <strong key={i} className="block text-cyan-200 mb-1">{line.replace(/\*\*/g, '')}</strong>
                     }
                     return <span key={i} className="block">{line}</span>
                })
            ) : (
                <span className="text-slate-500 italic">点击此处编写开发/交互逻辑...</span>
            )}
          </div>
        )}
      </div>
    </>
  );
};