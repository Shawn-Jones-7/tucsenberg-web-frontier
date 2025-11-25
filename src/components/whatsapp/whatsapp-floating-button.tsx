'use client';

import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { MessageCircle } from 'lucide-react';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';
import { WHATSAPP_STYLE_TOKENS } from '@/config/footer-links';

export interface WhatsAppFloatingButtonProps {
  number: string;
  label?: string;
  className?: string;
}

const POSITION_STORAGE_KEY = 'whatsapp-button-position';
const DEFAULT_POSITION = { x: 0, y: 0 };

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return digits;
};

/**
 * 从 localStorage 读取保存的位置
 */
const getStoredPosition = (): { x: number; y: number } => {
  try {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_POSITION;
  } catch {
    return DEFAULT_POSITION;
  }
};

/**
 * 保存位置到 localStorage
 */
const savePosition = (x: number, y: number): void => {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({ x, y }));
    // 触发 storage 事件以通知其他订阅者
    window.dispatchEvent(
      new StorageEvent('storage', { key: POSITION_STORAGE_KEY }),
    );
  } catch {
    // 忽略存储错误（如隐私模式）
  }
};

/**
 * 使用 useSyncExternalStore 安全地读取 localStorage
 * 避免 SSR/hydration 不匹配导致的 CLS
 */
function useStoredPosition() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return JSON.stringify(getStoredPosition());
  }, []);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(DEFAULT_POSITION);
  }, []);

  const positionString = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return JSON.parse(positionString) as { x: number; y: number };
}

export function WhatsAppFloatingButton({
  number,
  label = 'Chat with us on WhatsApp',
  className = '',
}: WhatsAppFloatingButtonProps) {
  const tokens = WHATSAPP_STYLE_TOKENS;
  const normalizedNumber = normalizePhoneNumber(number);
  const nodeRef = useRef<HTMLDivElement>(null);
  // 使用 useSyncExternalStore 安全读取 localStorage，避免 SSR/hydration CLS
  const storedPosition = useStoredPosition();
  const [localPosition, setLocalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 优先使用本地拖拽位置，否则使用存储的位置
  const position = localPosition ?? storedPosition;

  if (!normalizedNumber) return null;

  const href = `https://wa.me/${normalizedNumber}`;

  // 拖拽开始时标记状态
  const handleStart = () => {
    setIsDragging(false);
  };

  // 拖拽中标记为正在拖拽
  const handleDrag = () => {
    setIsDragging(true);
  };

  // 拖拽结束时保存位置
  const handleStop = (_e: unknown, data: { x: number; y: number }) => {
    const newPosition = { x: data.x, y: data.y };
    setLocalPosition(newPosition);
    savePosition(newPosition.x, newPosition.y);
    // 延迟重置拖拽状态，避免触发点击
    setTimeout(() => setIsDragging(false), 100);
  };

  // 点击处理：如果在拖拽，阻止默认行为
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds='body'
      position={position}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        role='complementary'
        aria-label='Support chat'
        className='fixed bottom-6 right-6 z-[1100]'
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <a
          aria-label={label}
          className={cn(
            'group relative flex items-center justify-center',
            tokens.transition,
            tokens.focusRing,
            tokens.light.background,
            tokens.light.foreground,
            tokens.light.border,
            tokens.light.hoverBackground,
            tokens.light.hoverBorder,
            tokens.light.hoverForeground,
            tokens.light.shadow,
            tokens.dark.background,
            tokens.dark.foreground,
            tokens.dark.border,
            tokens.dark.hoverBackground,
            tokens.dark.hoverBorder,
            tokens.dark.hoverForeground,
            tokens.dark.shadow,
            className,
          )}
          href={href}
          rel='noreferrer'
          target='_blank'
          onClick={handleClick}
          style={{
            width: `${tokens.sizePx}px`,
            height: `${tokens.sizePx}px`,
            borderRadius: `${tokens.borderRadiusPx}px`,
            borderWidth: tokens.borderWidthPx,
          }}
        >
          <MessageCircle
            className='transition-colors duration-150'
            style={{
              width: `${tokens.iconSizePx}px`,
              height: `${tokens.iconSizePx}px`,
            }}
            aria-hidden='true'
          />

          {/* Tooltip on hover */}
          <span
            className={cn(
              'pointer-events-none absolute bottom-full mb-2 w-max rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100',
              tokens.tooltip.background,
              tokens.tooltip.text,
            )}
          >
            {label}
          </span>
        </a>
      </div>
    </Draggable>
  );
}
