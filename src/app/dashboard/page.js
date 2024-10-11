'use client';

import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function Dashboard() {
  const categorias = ['Ações BR', 'Ações EUA', 'FIIs', 'Renda Fixa', 'Cripto'];
  const [valoresAtuais, setValoresAtuais] = useState(Array(categorias.length).fill(''));
  const [percentuaisIdeais, setPercentuaisIdeais] = useState(Array(categorias.length).fill(''));
  const [aporte, setAporte] = useState('');

  // Função para desformatar valores monetários
  const parseCurrency = (value) => {
    if (!value) return 0;
    const cleanValue = value.replace(/[^0-9,]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    if (value === '') return '';
    let cleanValue = value.replace(/[^0-9,]/g, '').replace(/\./g, '');
    let parts = cleanValue.split(',');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2);
    }
    return 'R$ ' + integerPart + (decimalPart ? ',' + decimalPart : '');
  };

  // Função para desformatar percentuais
  const parsePercentage = (value) => {
    if (!value) return 0;
    const cleanValue = value.replace(/[^0-9,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  // Função para formatar percentuais
  const formatPercentage = (value) => {
    if (value === '') return '';
    let cleanValue = value.replace(/[^0-9,]/g, '');
    if (cleanValue.includes(',')) {
      let parts = cleanValue.split(',');
      cleanValue = parts[0] + ',' + parts[1].substring(0, 2);
    }
    return cleanValue + '%';
  };

  const aporteNumber = parseCurrency(aporte);

  const totalInvestido = valoresAtuais.reduce(
    (acc, val) => acc + parseCurrency(val),
    0
  );

  const totalInvestidoNovo = totalInvestido + aporteNumber;

  const percentuaisAtuais = valoresAtuais.map((valor) => {
    const val = parseCurrency(valor);
    return totalInvestido ? (val / totalInvestido) * 100 : 0;
  });

  const valoresIdeais = categorias.map((_, index) => {
    const Vi = parseCurrency(valoresAtuais[index]);
    const Pi = parsePercentage(percentuaisIdeais[index]);
    const Ai = (Pi / 100) * totalInvestidoNovo - Vi;
    return Ai;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-1/4 p-8 bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">Informações</h2>
        <p className="mb-2">
          Valor Total Investido: R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="mb-4">
          <label className="block mb-2">Valor do Aporte</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={aporte}
            onChange={(e) => {
              const formatted = formatCurrency(e.target.value);
              setAporte(formatted);
            }}
          />
        </div>
        {/* Gráfico */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Distribuição Atual</h3>
          <Pie
            data={{
              labels: categorias,
              datasets: [
                {
                  data: valoresAtuais.map((val) => parseCurrency(val)),
                  backgroundColor: [
                    '#1f77b4',
                    '#ff7f0e',
                    '#2ca02c',
                    '#d62728',
                    '#9467bd',
                  ],
                },
              ],
            }}
            options={{
              plugins: {
                datalabels: {
                  color: 'white',
                  formatter: function (value, context) {
                    const index = context.dataIndex;
                    const percentual = percentuaisAtuais[index];
                    return percentual.toFixed(2) + '%';
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const index = context.dataIndex;
                      const valor = parseCurrency(valoresAtuais[index]);
                      const percentual = percentuaisAtuais[index];
                      return (
                        categorias[index] +
                        ': R$ ' +
                        valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
                        ' (' +
                        percentual.toFixed(2) +
                        '%)'
                      );
                    },
                  },
                },
                legend: {
                  display: true,
                  labels: {
                    color: 'white',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-bold mb-6">Portfólio</h2>
        <table className="w-full table-auto">
          {/* Cabeçalho da Tabela */}
          <thead>
            <tr>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Valor Atual</th>
              <th className="px-4 py-2">% Atual</th>
              <th className="px-4 py-2">% Ideal</th>
              <th className="px-4 py-2">Valor Ideal do Aporte</th>
            </tr>
          </thead>
          {/* Corpo da Tabela */}
          <tbody>
            {categorias.map((categoria, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{categoria}</td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    className="w-full bg-gray-700 p-2 rounded text-white"
                    value={valoresAtuais[index]}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      const newValores = [...valoresAtuais];
                      newValores[index] = formatted;
                      setValoresAtuais(newValores);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  {percentuaisAtuais[index].toFixed(2)}%
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    className="w-full bg-gray-700 p-2 rounded text-white"
                    value={percentuaisIdeais[index]}
                    onChange={(e) => {
                      const formatted = formatPercentage(e.target.value);
                      const newPercentuais = [...percentuaisIdeais];
                      newPercentuais[index] = formatted;
                      setPercentuaisIdeais(newPercentuais);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  R$ {valoresIdeais[index].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
