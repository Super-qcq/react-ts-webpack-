import React from 'react';

/**
 * BlossomDecor —— 页面两侧"整列开花"装饰（纯 CSS 动画，pointer-events:none，不挡操作）
 * 风格：柔和自然色（粉/奶白花瓣 + 绿茎），从 CSS Blossoming Flowers 吸取"花瓣盛开"技法，
 * 但做成轻量、适配亮色 UI：每侧沿竖向排 3 株花（隔开不缠在一起）。
 * 仅在窗口够宽（两侧有留白）时显示；窄屏自动隐藏，不影响布局。
 */
const PETALS = 6;

function Bloom({ tone }: { tone: 'pink' | 'cream' }) {
  return (
    <div className={`bloom ${tone === 'cream' ? 'is-cream' : ''}`}>
      <div className="bl-head">
        <div className="bl-petals">
          {Array.from({ length: PETALS }).map((_, i) => (
            <i
              key={i}
              className="bl-petal"
              style={{ transform: `rotate(${i * (360 / PETALS)}deg) translateY(-14px)` }}
            />
          ))}
        </div>
        <span className="bl-core" />
      </div>
      <span className="bl-stem" />
      <span className="bl-leaf l1" />
      <span className="bl-leaf l2" />
    </div>
  );
}

// 每侧沿竖向排 3 株（top 用百分比，天然隔开、错落不缠）
const LEFT = [
  { top: 12, tone: 'pink' as const },
  { top: 44, tone: 'cream' as const },
  { top: 74, tone: 'pink' as const },
];
const RIGHT = [
  { top: 18, tone: 'cream' as const },
  { top: 50, tone: 'pink' as const },
  { top: 80, tone: 'cream' as const },
];

const BlossomDecor = () => (
  <div className="bloss" aria-hidden="true">
    <div className="bloss-side is-left">
      {LEFT.map((it, i) => (
        <div key={i} className="bl-item" style={{ top: `${it.top}%` }}>
          <Bloom tone={it.tone} />
        </div>
      ))}
    </div>
    <div className="bloss-side is-right">
      {RIGHT.map((it, i) => (
        <div key={i} className="bl-item" style={{ top: `${it.top}%` }}>
          <Bloom tone={it.tone} />
        </div>
      ))}
    </div>
  </div>
);

export default BlossomDecor;
