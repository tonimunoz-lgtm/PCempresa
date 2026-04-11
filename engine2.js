// engine2.js — Funcions auxiliars del motor de joc
// Les funcions principals han estat integrades a l'index.html

window.generateDeptAIRequests = function(gd) {
  // Integrat directament a advanceWeek() de l'index.html
}

window.renderDeptRequests = function() {
  // Les notificacions es mostren al panell de notificacions del dashboard
}

window.buildHiredCompanyFinances = function(company) {
  const size = company.size || 'medium';
  const fact = company.fact || 1000000;
  const emp  = company.emp  || 20;
  const lf   = size === 'large' ? 'sa' : 'sl';
  const capital = lf === 'sa' ? 60000 : 15000;
  const rev_mes = Math.round(fact / 12);
  const cost_mes = Math.round(rev_mes * 0.72);

  return {
    legalForm: lf,
    legalFormName: lf === 'sa' ? 'Societat Anònima' : 'Societat Limitada',
    prestigi: size === 'large' ? 45 : size === 'medium' ? 28 : 12,
    yearsOld: 2024 - (company.founded || 2010),
    finances: {
      cash: Math.round(rev_mes * 0.12),
      monthly_revenue: rev_mes,
      monthly_costs:   cost_mes,
      annual_revenue: 0, annual_costs: 0,
      loans: [],
      revenue_history: Array.from({length:8},(_,i)=>({week:i+1,rev:Math.round(rev_mes*(0.9+Math.random()*0.2)),costs:Math.round(cost_mes*(0.9+Math.random()*0.2)),result:0})),
      actiu:  { immobilitzat: Math.round(fact*0.3), existencies: Math.round(fact*0.05), tresoreria: Math.round(rev_mes*0.12), clients: Math.round(rev_mes*0.45) },
      passiu: { capital, reserves: Math.round(fact*0.1), deutes_llarg: Math.round(fact*0.15), deutes_curt: Math.round(rev_mes*0.3), proveidors: Math.round(cost_mes*0.25) },
    },
    clients: [],
    suppliers: [],
    employees: [],
    machines: [],
  };
}
