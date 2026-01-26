
import React, { useState, useEffect } from 'react';
import { Incident, IncidentType } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface ReportsProps {
  incidents: Incident[];
}

const Reports: React.FC<ReportsProps> = ({ incidents }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(new Set());

  // By default, start with no incidents selected
  useEffect(() => {
    setSelectedIncidentIds(new Set());
  }, [incidents]);

  const toggleIncidentSelection = (id: string) => {
    const next = new Set(selectedIncidentIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIncidentIds(next);
  };

  const selectAll = () => {
    const next = new Set(incidents.map(i => i.id));
    setSelectedIncidentIds(next);
  };

  const clearSelection = () => {
    setSelectedIncidentIds(new Set());
  };

  const getCleanDescription = (inc: Incident) => {
    const typeLabel = typeof inc.type === 'string' ? inc.type : '';
    const regex = new RegExp(`^${typeLabel}[:\\s-]*`, 'i');
    return inc.description.replace(regex, '').trim();
  };

  const generatePDF = () => {
    if (selectedIncidentIds.size === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const exportIncidents = incidents.filter(i => selectedIncidentIds.has(i.id));

        doc.setFontSize(14);
        doc.setTextColor(0, 43, 92);
        doc.setFont("helvetica", "bold");
        doc.text("POLÍCIA MILITAR DO MARANHÃO", 105, 15, { align: "center" });
        doc.setFontSize(11);
        doc.text("43° BPM - P3", 105, 22, { align: "center" });
        doc.setDrawColor(180, 0, 0);
        doc.line(20, 30, 190, 30);
        doc.setFontSize(16);
        doc.text("RELATÓRIO ESTATÍSTICO OPERACIONAL", 105, 42, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);

        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 190, 52, { align: "right" });

        let currentY: number = 65;

        // Statistics Summary Section
        doc.setFillColor(0, 43, 92);
        doc.roundedRect(20, currentY, 170, 10, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("DADOS CONSOLIDADOS", 105, currentY + 7, { align: "center" });
        currentY += 10;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(20, currentY, 170, 45, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");

        const totalIncidents = exportIncidents.length;
        const totalConduzidos = exportIncidents.reduce((acc, curr) => acc + (curr.conductedCount || 0), 0);
        const totalFlagrantes = exportIncidents.filter(i => i.hasFlagrante === 'Sim').length;

        const totalWeapons = exportIncidents.filter(i => i.type === IncidentType.ARMA_FOGO).reduce((acc, curr) => acc + (curr.weaponCount || 1), 0);
        const totalSimulacra = exportIncidents.filter(i => i.type === IncidentType.SIMULACRO).reduce((acc, curr) => acc + (curr.simulacrumCount || 1), 0);
        const totalVehiclesRec = exportIncidents.filter(i => i.type === IncidentType.VEICULO_RECUPERADO).reduce((acc, curr) => acc + (curr.vehicleCount || 1), 0);
        const totalVehiclesStolen = exportIncidents.filter(i => i.type === IncidentType.FURTO_VEICULO).reduce((acc, curr) => acc + (curr.stolenVehicleCount || 1), 0);
        const totalVehiclesRobbed = exportIncidents.filter(i => i.type === IncidentType.ROUBO_VEICULO).reduce((acc, curr) => acc + (curr.robbedVehicleCount || 1), 0);

        const tcoCount = exportIncidents.filter(i => i.isTco).length;
        const boCount = totalIncidents - tcoCount;

        const totalCvliVictims = exportIncidents.filter(i => i.type === IncidentType.CVLI || (i.type as string) === 'CVLI').reduce((acc, curr) => {
          return acc + (curr.victimCount || (curr.victim ? curr.victim.split(',').length : 1));
        }, 0);

        const totalMorteIntervencaoVictims = exportIncidents.filter(i => i.type === IncidentType.MORTE_INTERVENCAO).reduce((acc, curr) => {
          return acc + (curr.victimCount || (curr.victim ? curr.victim.split(',').length : 1));
        }, 0);

        // Calculate needed height for right column
        let rightRowsCount = 2; // Flagrantes + Conduzidos
        if (totalCvliVictims > 0) rightRowsCount++;
        if (totalMorteIntervencaoVictims > 0) rightRowsCount++;
        if (totalWeapons > 0) rightRowsCount++;
        if (totalSimulacra > 0) rightRowsCount++;
        if (totalVehiclesRec > 0) rightRowsCount++;
        if (totalVehiclesStolen > 0) rightRowsCount++;
        if (totalVehiclesRobbed > 0) rightRowsCount++;

        const boxHeight = Math.max(45, (rightRowsCount * 8) + 12);

        // Draw the background box FIRST
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(20, currentY, 170, boxHeight, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");

        doc.text(`Total de Registros: ${totalIncidents}`, 25, currentY + 10);
        doc.text(`- Boletins de Ocorrência (B.O): ${boCount}`, 30, currentY + 18);
        doc.text(`- Termos Circunstanciados (TCO): ${tcoCount}`, 30, currentY + 26);

        doc.text(`Ocorrências com Flagrante: ${totalFlagrantes}`, 110, currentY + 10);
        doc.text(`Total de Conduzidos: ${totalConduzidos}`, 110, currentY + 18);

        let rightColY = 26;
        if (totalCvliVictims > 0) {
          doc.text(`Vítimas de CVLI: ${totalCvliVictims}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalMorteIntervencaoVictims > 0) {
          doc.text(`Mortes por Intervenção: ${totalMorteIntervencaoVictims}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalWeapons > 0) {
          doc.text(`Armas Apreendidas: ${totalWeapons}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalSimulacra > 0) {
          doc.text(`Simulacros Apreendidos: ${totalSimulacra}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalVehiclesRec > 0) {
          doc.text(`Veículos Recuperados: ${totalVehiclesRec}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalVehiclesStolen > 0) {
          doc.text(`Veículos Furtados: ${totalVehiclesStolen}`, 110, currentY + rightColY);
          rightColY += 8;
        }
        if (totalVehiclesRobbed > 0) {
          doc.text(`Veículos Roubados: ${totalVehiclesRobbed}`, 110, currentY + rightColY);
        }

        currentY += boxHeight + 10;

        // Detailed List
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(12); doc.setTextColor(0, 43, 92); doc.setFont("helvetica", "bold");
        doc.text("DETALHAMENTO DE OCORRÊNCIAS", 20, currentY);
        currentY += 12;

        exportIncidents.forEach((inc, idx) => {
          if (currentY > 240) { doc.addPage(); currentY = 20; }

          doc.setFontSize(9); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
          const title = `${idx + 1}. [${inc.incidentNumber}] - ${inc.type}${inc.isTco ? ' (TCO)' : ''}`;
          doc.text(title, 20, currentY);

          currentY += 6;
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
          const dateStr = new Date(inc.date).toLocaleString('pt-BR');
          doc.text(`Data/Hora: ${dateStr} | SIGMA: ${inc.sigma || 'N/A'} | Local: ${inc.location.address}`, 25, currentY);
          currentY += 5;

          doc.setFont("helvetica", "bold"); doc.setTextColor(0, 43, 92);
          let detailLines: string[] = [];

          if (inc.garrison) detailLines.push(`GUARNICAO: ${inc.garrison}`);
          if (inc.conductedCount) detailLines.push(`CONDUZIDOS: ${inc.conductedCount} (${(inc.conductedProfiles || []).join(', ')})`);
          if (inc.hasFlagrante !== 'Não Informado') detailLines.push(`FLAGRANTE: ${inc.hasFlagrante}`);

          // Type specific details
          if (inc.weaponType) detailLines.push(`ARMA: ${inc.weaponType} | QTD: ${inc.weaponCount || 1} | MUNIÇÃO: ${inc.ammoIntactCount}i/${inc.ammoDeflagratedCount}d`);
          if (inc.simulacrumCount && inc.type === IncidentType.SIMULACRO) detailLines.push(`SIMULACROS: ${inc.simulacrumCount}`);
          if (inc.victim) detailLines.push(`VITIMA(S): ${inc.victim} (Total: ${inc.victimCount || inc.victim.split(',').length})`);
          if (inc.vehicleDetails) detailLines.push(`VEICULO: ${inc.vehicleDetails} | QTD: ${inc.vehicleCount || inc.stolenVehicleCount || inc.robbedVehicleCount || 1}`);
          if (inc.stolenDetails) detailLines.push(`BENS/DINAMICA: ${inc.stolenDetails}`);
          if (inc.cvliType) detailLines.push(`DETALHE NATUREZA: ${inc.cvliType}`);
          if (inc.drugDetails) detailLines.push(`DROGAS: ${inc.drugDetails}`);

          detailLines.forEach(line => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(line, 25, currentY);
            currentY += 4;
          });

          // Description (Relato Técnico)
          doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0);
          const desc = `RELATO: ${getCleanDescription(inc)}`;
          const splitDesc = doc.splitTextToSize(desc, 170);

          if (currentY + (splitDesc.length * 4) > 280) { doc.addPage(); currentY = 20; }
          doc.text(splitDesc, 25, currentY);
          currentY += (splitDesc.length * 4) + 6;

          doc.setDrawColor(230, 230, 230);
          doc.line(25, currentY - 3, 185, currentY - 3);
          currentY += 2;
        });

        doc.save(`Relatorio_P3_${new Date().getTime()}.pdf`);
      } catch (err) {
        console.error(err);
        alert("Erro ao gerar PDF: " + (err as any).message);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const generateWord = () => {
    if (selectedIncidentIds.size === 0) return;
    setIsGenerating(true);

    try {
      const exportIncidents = incidents.filter(i => selectedIncidentIds.has(i.id));

      const totalIncidents = exportIncidents.length;
      const totalConduzidos = exportIncidents.reduce((acc, curr) => acc + (curr.conductedCount || 0), 0);
      const totalFlagrantes = exportIncidents.filter(i => i.hasFlagrante === 'Sim').length;

      const totalWeapons = exportIncidents.filter(i => i.type === IncidentType.ARMA_FOGO).reduce((acc, curr) => acc + (curr.weaponCount || 1), 0);
      const totalSimulacra = exportIncidents.filter(i => i.type === IncidentType.SIMULACRO).reduce((acc, curr) => acc + (curr.simulacrumCount || 1), 0);
      const totalVehiclesRec = exportIncidents.filter(i => i.type === IncidentType.VEICULO_RECUPERADO).reduce((acc, curr) => acc + (curr.vehicleCount || 1), 0);
      const totalVehiclesStolen = exportIncidents.filter(i => i.type === IncidentType.FURTO_VEICULO).reduce((acc, curr) => acc + (curr.stolenVehicleCount || 1), 0);
      const totalVehiclesRobbed = exportIncidents.filter(i => i.type === IncidentType.ROUBO_VEICULO).reduce((acc, curr) => acc + (curr.robbedVehicleCount || 1), 0);

      const tcoCount = exportIncidents.filter(i => i.isTco).length;
      const boCount = totalIncidents - tcoCount;

      const totalCvliVictims = exportIncidents.filter(i => i.type === IncidentType.CVLI || (i.type as string) === 'CVLI').reduce((acc, curr) => {
        return acc + (curr.victimCount || (curr.victim ? curr.victim.split(',').length : 1));
      }, 0);

      const totalMorteIntervencaoVictims = exportIncidents.filter(i => i.type === IncidentType.MORTE_INTERVENCAO).reduce((acc, curr) => {
        return acc + (curr.victimCount || (curr.victim ? curr.victim.split(',').length : 1));
      }, 0);

      let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Relatório Operacional 43 BPM</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; border-bottom: 2px solid #b8102e; padding-bottom: 10px; margin-bottom: 20px; }
                .inst { color: #002b5c; font-weight: bold; margin-bottom: 0; }
                .title { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: center; }
                .summary-box { background-color: #f8fafc; border: 2px solid #002b5c; padding: 15px; margin-bottom: 30px; border-radius: 5px; }
                .incident-item { border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px; }
                .inc-header { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
                .inc-meta { font-size: 10px; color: #666; margin-bottom: 4px; }
                .inc-desc { font-size: 11px; color: #333; }
                .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #999; }
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; padding: 5px; }
            </style>
            </head>
            <body>
                <div class="header">
                    <p class="inst">POLÍCIA MILITAR DO MARANHÃO</p>
                    <p style="margin-top: 0;">43° BPM - P3</p>
                </div>
                
                <h1 class="title">RELATÓRIO ESTATÍSTICO OPERACIONAL</h1>
                <p style="text-align: center; font-size: 10px;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>

                <div class="summary-box">
                    <h2 style="margin-top:0; font-size: 14px; text-transform: uppercase; color: #002b5c;">DADOS CONSOLIDADOS</h2>
                    <table style="border:none; width: 100%;">
                        <tr>
                            <td style="width: 50%;">
                                <strong>Total de Registros:</strong> ${totalIncidents}<br/>
                                - Boletins de Ocorrência (B.O): ${boCount}<br/>
                                - Termos Circunstanciados (TCO): ${tcoCount}
                            </td>
                            <td style="width: 50%;">
                                <strong>Flagrantes:</strong> ${totalFlagrantes}<br/>
                                <strong>Conduzidos:</strong> ${totalConduzidos}<br/>
                                ${totalCvliVictims > 0 ? `<strong>Vítimas de CVLI:</strong> ${totalCvliVictims}<br/>` : ''}
                                ${totalMorteIntervencaoVictims > 0 ? `<strong>Mortes por Intervenção:</strong> ${totalMorteIntervencaoVictims}<br/>` : ''}
                                ${totalWeapons > 0 ? `<strong>Armas Apreendidas:</strong> ${totalWeapons}<br/>` : ''}
                                ${totalSimulacra > 0 ? `<strong>Simulacros Apreendidos:</strong> ${totalSimulacra}<br/>` : ''}
                                ${totalVehiclesRec > 0 ? `<strong>Veículos Recuperados:</strong> ${totalVehiclesRec}<br/>` : ''}
                                ${totalVehiclesStolen > 0 ? `<strong>Veículos Furtados:</strong> ${totalVehiclesStolen}<br/>` : ''}
                                ${totalVehiclesRobbed > 0 ? `<strong>Veículos Roubados:</strong> ${totalVehiclesRobbed}` : ''}
                            </td>
                        </tr>
                    </table>
                </div>

                <h2 style="font-size: 16px; color: #002b5c; border-bottom: 1px solid #ccc; padding-bottom: 5px;">DETALHAMENTO DE OCORRÊNCIAS</h2>
                
                ${exportIncidents.map((inc, idx) => `
                    <div class="incident-item">
                        <div class="inc-header">${idx + 1}. [${inc.incidentNumber}] - ${inc.type} ${inc.isTco ? '(TCO)' : ''}</div>
                        <div class="inc-meta">
                            Data: ${new Date(inc.date).toLocaleString('pt-BR')}<br/>
                            SIGMA: ${inc.sigma || 'N/A'} | Local: ${inc.location.address}<br/>
                            ${inc.garrison ? `<strong>Guarnição:</strong> ${inc.garrison}<br/>` : ''}
                            ${inc.conductedCount ? `<strong>Conduzidos:</strong> ${inc.conductedCount} (${(inc.conductedProfiles || []).join(', ')})<br/>` : ''}
                            ${inc.hasFlagrante !== 'Não Informado' ? `<strong>Flagrante:</strong> ${inc.hasFlagrante}<br/>` : ''}
                            ${inc.weaponType ? `<strong>Arma:</strong> ${inc.weaponType} | Qtd: ${inc.weaponCount || 1}<br/>` : ''}
                            ${inc.simulacrumCount && inc.type === IncidentType.SIMULACRO ? `<strong>Simulacros:</strong> ${inc.simulacrumCount}<br/>` : ''}
                            ${inc.victim ? `<strong>Vítima(s):</strong> ${inc.victim} (Total: ${inc.victimCount || inc.victim.split(',').length})<br/>` : ''}
                            ${inc.vehicleDetails ? `<strong>Veículo:</strong> ${inc.vehicleDetails} | Qtd: ${inc.vehicleCount || inc.stolenVehicleCount || inc.robbedVehicleCount || 1}<br/>` : ''}
                            ${inc.cvliType ? `<strong>Detalhe:</strong> ${inc.cvliType}<br/>` : ''}
                            ${inc.drugDetails ? `<strong>Drogas:</strong> ${inc.drugDetails}<br/>` : ''}
                        </div>
                        <div class="inc-desc"><strong>Relato:</strong> ${getCleanDescription(inc)}</div>
                    </div>
                `).join('')}

                <div class="footer">
                    <br/><br/>
                    <p>________________________________________________</p>
                    <p><strong>COORDENADOR DE OPERAÇÕES E ESTATÍSTICA (P-3) / 43° BPM</strong></p>
                </div>
            </body>
            </html>
        `;

      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      saveAs(blob, `Relatorio_P3_${new Date().getTime()}.doc`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar Word.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-file-export text-[#ffd700]"></i>
              Exportação de Relatórios
            </h2>
            <p className="text-slate-400 text-xs">Exibindo registros conforme filtros aplicados na tela anterior.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={generatePDF} disabled={isGenerating || selectedIncidentIds.size === 0} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${selectedIncidentIds.size > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-pdf"></i>} PDF
            </button>
            <button onClick={generateWord} disabled={isGenerating || selectedIncidentIds.size === 0} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${selectedIncidentIds.size > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-word"></i>} Word
            </button>
          </div>
        </div>

        <div className="bg-[#020617] rounded-2xl border border-slate-800/50 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 px-3 py-1 rounded text-xs font-bold text-white">
              Total: {incidents.length}
            </div>
            <div className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs font-bold border border-blue-900/50">
              Selecionados: {selectedIncidentIds.size}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-[10px] font-black text-white uppercase bg-white/5 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Todos</button>
            <button onClick={clearSelection} className="text-[10px] font-black text-red-400 uppercase bg-red-500/5 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors">Nenhum</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.length > 0 ? incidents.map(inc => (
          <div key={inc.id} onClick={() => toggleIncidentSelection(inc.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${selectedIncidentIds.has(inc.id) ? 'bg-[#ffd700]/10 border-[#ffd700] shadow-lg shadow-[#ffd700]/5' : 'bg-slate-800/20 border-slate-800 hover:border-slate-600'}`}>
            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${selectedIncidentIds.has(inc.id) ? 'bg-[#ffd700] border-[#ffd700]' : 'border-slate-600 group-hover:border-slate-500'}`}>
              {selectedIncidentIds.has(inc.id) && <i className="fa-solid fa-check text-[#002b5c] text-[10px]"></i>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-[#ffd700] uppercase tracking-tighter">{inc.incidentNumber}</span>
                <span className="text-[9px] font-black text-slate-500">{new Date(inc.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase truncate" title={inc.type}>{inc.type}</h4>
              <p className="text-[10px] text-slate-400 truncate mt-1">{inc.location.address}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <i className="fa-solid fa-filter text-slate-700 text-4xl mb-4"></i>
            <p className="text-slate-500 font-bold uppercase text-sm">Nenhum registro encontrado para exportação.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
