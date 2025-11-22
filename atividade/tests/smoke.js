/**
 * SMOKE TEST
 * Objetivo: Verificar se a API está funcionando antes de testes pesados
 * Configuração: 1 usuário por 30 segundos acessando /health
 * Critério: 100% de sucesso nas requisições
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1, // 1 usuário virtual
  duration: '30s', // Por 30 segundos
  
  thresholds: {
    http_req_failed: ['rate==0'], // 100% de sucesso (0% de falha)
    http_req_duration: ['p(95)<200'], // 95% das requisições abaixo de 200ms
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');
  
  check(res, {
    'status é 200': (r) => r.status === 200,
    'resposta contém status UP': (r) => r.json('status') === 'UP',
    'resposta possui timestamp': (r) => r.json('timestamp') !== undefined,
  });
  
  sleep(1); // Aguarda 1 segundo entre requisições
}