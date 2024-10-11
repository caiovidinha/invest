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

  // Inicializa percentuaisIdeais com '20,00' para cada categoria
  const [percentuaisIdeais, setPercentuaisIdeais] = useState(Array(categorias.length).fill('20,00'));

  // Armazena os valores atuais em centavos
  const [valoresAtuais, setValoresAtuais] = useState(Array(categorias.length).fill(0));
  // Armazena os dígitos digitados pelo usuário para cada campo "Valor Atual"
  const [valorAtualInputs, setValorAtualInputs] = useState(Array(categorias.length).fill(''));

  const [aporteInput, setAporteInput] = useState(''); // Armazena os dígitos digitados no aporte

  // Função para formatar centavos para 'R$ 0,00'
  const formatCurrencyFromCents = (valueInCents) => {
    const value = (valueInCents / 100).toFixed(2);
    return `R$ ${value.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  // Função para formatar dígitos para 'R$ 0,00'
  const formatCurrencyFromDigits = (digits) => {
    const paddedDigits = digits.padStart(3, '0');
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?!$)/, '') || '0';
    const decimalPart = paddedDigits.slice(-2);
    const formatted = `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
    return formatted;
  };

  // Função para desformatar percentuais
  const parsePercentage = (value) => {
    if (!value) return 0;
    const cleanValue = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  // Valor do aporte em centavos
  const aporteValueInCents = parseInt(aporteInput, 10) || 0;

  // Total Investido em reais
  const totalInvestido = valoresAtuais.reduce(
    (acc, val) => acc + val,
    0
  ) / 100;

  const totalInvestidoNovo = totalInvestido + aporteValueInCents / 100;

  // Calcula percentuais atuais
  const percentuaisAtuais = valoresAtuais.map((valor) => {
    return totalInvestido ? (valor / 100 / totalInvestido) * 100 : 0;
  });

  // Calcula valores ideais de aporte
  const valoresIdeaisBrutos = categorias.map((_, index) => {
    const Vi = valoresAtuais[index] / 100; // Converte centavos para reais
    const Pi = parsePercentage(percentuaisIdeais[index]) || 0;
    const Ai = (Pi / 100) * totalInvestidoNovo - Vi;
    // Evita valores negativos
    return Math.max(0, Ai);
  });

  // Soma dos aportes individuais
  const somaAportesIndividuais = valoresIdeaisBrutos.reduce((acc, val) => acc + val, 0);

  // Ajusta os aportes individuais se a soma exceder o aporte total
  let valoresIdeais = [...valoresIdeaisBrutos];

  if (somaAportesIndividuais > aporteValueInCents / 100) {
    const proporcao = (aporteValueInCents / 100) / somaAportesIndividuais;
    valoresIdeais = valoresIdeais.map((val) => val * proporcao);
  }

  // Calcula a soma dos percentuais ideais
  const totalPercentualIdeal = percentuaisIdeais.reduce(
    (sum, p) => sum + parsePercentage(p),
    0
  );

  // Mensagem de aviso
  const mensagemAviso =
    totalPercentualIdeal !== 100
      ? `Por favor, complete a porcentagem correta. ${totalPercentualIdeal.toFixed(2).replace('.', ',')}%/100%.`
      : '';

  // Funções para incrementar e decrementar percentuais ideais
  const incrementPercentage = (index) => {
    const currentPercentages = percentuaisIdeais.map((p) => parsePercentage(p));
    const totalPercentage = currentPercentages.reduce((sum, p) => sum + p, 0);
    if (totalPercentage >= 100) return; // Não pode exceder 100%

    const newPercentages = [...currentPercentages];
    newPercentages[index] = Math.min(newPercentages[index] + 1, 100);
    setPercentuaisIdeais(newPercentages.map((p) => p.toFixed(2).replace('.', ',')));
  };

  const decrementPercentage = (index) => {
    const currentPercentages = percentuaisIdeais.map((p) => parsePercentage(p));
    const newPercentages = [...currentPercentages];
    newPercentages[index] = Math.max(currentPercentages[index] - 1, 0);
    setPercentuaisIdeais(newPercentages.map((p) => p.toFixed(2).replace('.', ',')));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-1/4 p-8 bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">Informações</h2>
        <p className="mb-2">
          Valor Total Investido: {formatCurrencyFromCents(totalInvestido * 100)}
        </p>
        <div className="mb-4">
          <label className="block mb-2">Valor do Aporte</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formatCurrencyFromDigits(aporteInput)}
            onChange={(e) => {
              const inputDigits = e.target.value.replace(/\D/g, '');
              setAporteInput(inputDigits);
            }}
          />
        </div>
        {/* Mensagem de aviso se a soma dos percentuais ideais não for 100% */}
        {mensagemAviso && (
          <div className="text-yellow-400 mb-4">{mensagemAviso}</div>
        )}
        {/* Gráfico */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Distribuição Atual</h3>
          <Pie
            data={{
              labels: categorias,
              datasets: [
                {
                  data: valoresAtuais.map((val) => val / 100), // Converte centavos para reais
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
                      const valor = valoresAtuais[index] / 100;
                      const percentual = percentuaisAtuais[index];
                      return (
                        categorias[index] +
                        ': R$ ' +
                        valor.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) +
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
                    value={formatCurrencyFromDigits(valorAtualInputs[index])}
                    onChange={(e) => {
                      const newValorAtualInputs = [...valorAtualInputs];
                      const inputDigits = e.target.value.replace(/\D/g, '');
                      newValorAtualInputs[index] = inputDigits;
                      setValorAtualInputs(newValorAtualInputs);

                      // Atualiza o valor em centavos
                      const newValores = [...valoresAtuais];
                      newValores[index] = parseInt(inputDigits, 10) || 0;
                      setValoresAtuais(newValores);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  {percentuaisAtuais[index].toFixed(2)}%
                </td>
                <td className="border px-4 py-2">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => decrementPercentage(index)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-l h-10"
                    >
                      -
                    </button>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-24 bg-gray-700 text-left pl-5 text-white h-10"
                        value={percentuaisIdeais[index]}
                        onChange={(e) => {
                          let value = e.target.value;
                          const numValue = parsePercentage(value);
                          const totalOthers = percentuaisIdeais.reduce(
                            (sum, p, i) =>
                              i !== index ? sum + parsePercentage(p) : sum,
                            0
                          );
                          if (numValue + totalOthers > 100) {
                            const maxAllowed = 100 - totalOthers;
                            value = maxAllowed.toFixed(2).replace('.', ',');
                          }
                          const newPercentuais = [...percentuaisIdeais];
                          newPercentuais[index] = value;
                          setPercentuaisIdeais(newPercentuais);
                        }}
                        onBlur={() => {
                          const value = percentuaisIdeais[index];
                          const numValue = parsePercentage(value);
                          const formattedValue = numValue.toFixed(2).replace('.', ',');
                          const newPercentuais = [...percentuaisIdeais];
                          newPercentuais[index] = formattedValue;
                          setPercentuaisIdeais(newPercentuais);
                        }}
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-white">
                        %
                      </span>
                    </div>
                    <button
                      onClick={() => incrementPercentage(index)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-r h-10"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="border px-4 py-2">
                  R${' '}
                  {valoresIdeais[index].toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
