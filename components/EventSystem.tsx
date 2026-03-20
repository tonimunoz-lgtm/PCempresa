"use client";
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Event } from '@/lib/types';

const EVENT_CONFIGS = {
  earthquake: { emoji: '🌋', color: '#ff6b00', sound: 'boom' },
  robbery: { emoji: '🦹', color: '#ff3333', sound: 'alarm' },
  fire: { emoji: '🔥', color: '#ff4400', sound: 'fire' },
  strike: { emoji: '✊', color: '#ffaa00', sound: 'whistle' },
  flood: { emoji: '🌊', color: '#4488ff', sound: 'splash' },
  health_inspection: { emoji: '🏥', color: '#ff88aa', sound: 'ding' },
  viral: { emoji: '📱', color: '#00ffaa', sound: 'ding' },
  alien_order: { emoji: '👽', color: '#aa88ff', sound: 'blip' },
};

function generateRandomEvent(securityLevel: number, level: number): Event | null {
  const rand = Math.random();
  
  // Higher security = less bad events
  const badChance = Math.max(0.005, 0.015 - securityLevel * 0.001);
  const goodChance = 0.008 + level * 0.001;
  
  if (rand < badChance) {
    const badEvents = ['earthquake','robbery','fire','strike','flood','health_inspection'];
    const type = badEvents[Math.floor(Math.random() * badEvents.length)] as Event['type'];
    const lossPercent = 0.05 + Math.random() * 0.15;
    
    const titles: Record<string, string> = {
      earthquake: '¡Terremoto!',
      robbery: '¡Robo en el local!',
      fire: '¡Incendio!',
      strike: '¡Huelga del personal!',
      flood: '¡Inundación!',
      health_inspection: '¡Inspección sanitaria!',
    };
    const descs: Record<string, string> = {
      earthquake: 'El Vesubio ha decidido despertarse. Daños en el horno.',
      robbery: 'Alguien se llevó el efectivo de la caja.',
      fire: 'El horno se ha sobrecalentado. Pizzas perdidas.',
      strike: 'Los empleados piden mejores condiciones. Producción parada.',
      flood: 'Las cañerías han fallado. El sótano está bajo el agua.',
      health_inspection: 'El inspector ha encontrado irregularidades. Multa.',
    };
    
    return {
      id: `evt_${Date.now()}`,
      type,
      title: titles[type] || '¡Evento!',
      description: descs[type] || 'Ha ocurrido algo inesperado.',
      pizzaLoss: lossPercent,
      timestamp: Date.now(),
    };
  }
  
  if (rand < badChance + goodChance) {
    const goodEvents = [
      { type: 'viral' as Event['type'], title: '¡Viral en redes!', description: 'Tu pizza ha aparecido en TikTok. ¡Pedidos disparados!', pizzaGain: 0.2 },
      { type: 'alien_order' as Event['type'], title: '¡Pedido alienígena!', description: 'Una nave espacial ha pedido 500 pizzas margheritas.', pizzaGain: 0.3 },
    ];
    const evt = goodEvents[Math.floor(Math.random() * goodEvents.length)];
    return { id: `evt_${Date.now()}`, ...evt, timestamp: Date.now() };
  }
  
  return null;
}

export default function EventSystem() {
  const { events, addEvent, removeEvent, securityLevel, level, pizzas, totalPizzas } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const evt = generateRandomEvent(securityLevel || 0, level);
      if (evt) {
        // Calculate actual pizza loss/gain based on current pizzas
        if (evt.pizzaLoss) {
          const actualLoss = Math.floor(pizzas * evt.pizzaLoss);
          evt.pizzaLoss = actualLoss;
        }
        if (evt.pizzaGain) {
          const actualGain = Math.floor(totalPizzas * evt.pizzaGain * 0.01);
          evt.pizzaGain = Math.max(10, actualGain);
        }
        addEvent(evt);
        // Auto-remove after 8 seconds
        setTimeout(() => removeEvent(evt.id), 8000);
      }
    }, 8000);
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [securityLevel, level, pizzas, totalPizzas, addEvent, removeEvent]);

  if (events.length === 0) return null;

  return (
    <div className="events-container">
      {events.slice(0, 3).map((evt) => {
        const config = EVENT_CONFIGS[evt.type] || { emoji: '⚡', color: '#ffffff' };
        const isGood = evt.pizzaGain !== undefined;
        
        return (
          <div 
            key={evt.id}
            className={`event-toast ${isGood ? 'good' : 'bad'}`}
            style={{ borderColor: config.color + '60', boxShadow: `0 0 20px ${config.color}30` }}
            onClick={() => removeEvent(evt.id)}
          >
            <span className="event-emoji">{config.emoji}</span>
            <div className="event-content">
              <div className="event-title" style={{ color: config.color }}>{evt.title}</div>
              <div className="event-desc">{evt.description}</div>
              {evt.pizzaLoss && evt.pizzaLoss > 0 && (
                <div className="event-impact loss">-{Math.floor(evt.pizzaLoss as number)} 🍕</div>
              )}
              {evt.pizzaGain && evt.pizzaGain > 0 && (
                <div className="event-impact gain">+{Math.floor(evt.pizzaGain as number)} 🍕</div>
              )}
            </div>
            <button className="event-dismiss" onClick={() => removeEvent(evt.id)}>✕</button>
          </div>
        );
      })}

      <style jsx>{`
        .events-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 200;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 320px;
          pointer-events: none;
        }
        .event-toast {
          background: rgba(10, 5, 15, 0.95);
          border: 1.5px solid;
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          backdrop-filter: blur(20px);
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: all;
          cursor: pointer;
        }
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .event-emoji { font-size: 28px; flex-shrink: 0; }
        .event-content { flex: 1; min-width: 0; }
        .event-title { font-weight: 800; font-size: 13px; margin-bottom: 3px; }
        .event-desc { color: rgba(255,255,255,0.55); font-size: 11px; line-height: 1.4; }
        .event-impact { font-weight: 900; font-size: 14px; margin-top: 5px; }
        .event-impact.loss { color: #ff4444; }
        .event-impact.gain { color: #44ff88; }
        .event-dismiss { 
          background: rgba(255,255,255,0.1); 
          border: none; color: rgba(255,255,255,0.4); 
          width: 22px; height: 22px; border-radius: 50%; 
          cursor: pointer; font-size: 11px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>
    </div>
  );
}
