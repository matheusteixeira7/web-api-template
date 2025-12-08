**Branch da Feature**: `001-clinic-scheduling-saas`**Criado em**: 2025-11-23
**Status**: Rascunho
**Input**: Descrição do usuário: "Plataforma SaaS de agendamento e gestão para clínicas de pequeno/médio porte no Brasil"

## Cenários de Usuário & Testes _(obrigatório)_

### História de Usuário 1 - Gestão de Agenda Multi-Profissional (Prioridade: P1)

A recepcionista da clínica gerencia agendamentos de consultas para múltiplos profissionais de saúde (2-10 profissionais) usando uma interface de agenda compartilhada. A recepcionista pode visualizar as agendas de todos os profissionais simultaneamente, criar novos agendamentos selecionando horários disponíveis e atribuir pacientes a profissionais específicos.

**Por que esta prioridade**: Esta é a proposta de valor central - resolver o caos do agendamento manual. Sem isso, a plataforma não tem propósito. As clínicas identificaram isso como seu principal ponto de dor.

**Teste Independente**: Pode ser totalmente testado criando uma conta de clínica com 3 profissionais, agendando 10 consultas em diferentes horários e verificando se todos os agendamentos aparecem corretamente na visualização individual da agenda de cada profissional. Entrega valor imediato ao substituir agendamento em papel/planilhas.

**Cenários de Aceitação**:

1. **Dado** que uma recepcionista está visualizando a agenda multi-profissional, **Quando** ela seleciona um horário disponível para um profissional específico, **Então** ela pode criar um novo agendamento com os dados do paciente
2. **Dado** que múltiplos profissionais têm consultas agendadas, **Quando** a recepcionista visualiza a agenda, **Então** todos os agendamentos são exibidos com distinção visual clara entre profissionais
3. **Dado** que um horário já está reservado, **Quando** a recepcionista tenta agendar outra consulta nesse horário, **Então** o sistema previne o agendamento duplo e mostra uma mensagem de erro clara
4. **Dado** que existe um agendamento, **Quando** a recepcionista precisa modificá-lo, **Então** ela pode reagendar para um horário diferente ou reatribuir para um profissional diferente

---

### História de Usuário 2 - Cadastro e Gestão de Pacientes (Prioridade: P1)

A recepcionista mantém um banco de dados com informações dos pacientes incluindo nome, dados de contato, data de nascimento e número do prontuário. Ao agendar consultas, a recepcionista pode buscar pacientes existentes ou cadastrar novos rapidamente.

**Por que esta prioridade**: Base essencial para gestão de agenda P1. Não é possível agendar consultas sem dados dos pacientes. Clínicas precisam disso para eliminar registros duplicados e manter histórico de pacientes.

**Teste Independente**: Pode ser totalmente testado cadastrando 20 pacientes, buscando por nome/telefone/ID, atualizando informações de contato e verificando se os dados persistem corretamente. Entrega valor ao substituir fichas físicas ou planilhas desorganizadas.

**Cenários de Aceitação**:

1. **Dado** que a recepcionista precisa agendar uma consulta, **Quando** ela busca por um paciente pelo nome ou telefone, **Então** o sistema exibe os registros de pacientes correspondentes
2. **Dado** que um paciente visita pela primeira vez, **Quando** a recepcionista insere os dados do paciente (nome, telefone, data de nascimento, contato), **Então** um novo registro de paciente é criado em menos de 1 minuto
3. **Dado** que as informações de contato de um paciente mudam, **Quando** a recepcionista atualiza o registro, **Então** as mudanças são salvas e refletidas em todos os agendamentos futuros
4. **Dado** que múltiplos pacientes têm nomes similares, **Quando** buscar, **Então** o sistema exibe todos os resultados com informações distintivas (data de nascimento, telefone, última visita)

---

### História de Usuário 3 - Confirmações Automáticas de Consulta via WhatsApp (Prioridade: P2)

O sistema envia automaticamente mensagens de WhatsApp aos pacientes 24 horas antes das consultas agendadas, pedindo que confirmem presença. A recepcionista visualiza o status de confirmação na agenda e recebe notificações quando pacientes respondem.

**Por que esta prioridade**: Automação de alto valor que reduz diretamente as faltas (identificadas como grande perda de receita). Construída sobre a base P1, mas a plataforma é utilizável sem ela.

**Teste Independente**: Pode ser totalmente testado agendando consultas para amanhã, verificando se mensagens WhatsApp são enviadas via API oficial, fazendo pacientes de teste confirmarem/cancelarem e checando se a agenda atualiza adequadamente. Entrega valor mensurável através da redução de faltas.

**Cenários de Aceitação**:

1. **Dado** que uma consulta está agendada para amanhã, **Quando** a janela de confirmação chega (24 horas antes), **Então** o sistema envia uma mensagem WhatsApp ao paciente com detalhes da consulta
2. **Dado** que um paciente recebe uma solicitação de confirmação, **Quando** ele responde com confirmação, **Então** o status da consulta atualiza para "Confirmado" na agenda
3. **Dado** que um paciente precisa cancelar, **Quando** ele responde indicando cancelamento, **Então** a consulta é marcada como cancelada e o horário fica disponível
4. **Dado** que um paciente não responde, **Quando** 4 horas antes da consulta chegam, **Então** a recepcionista vê um indicador visual para consultas não confirmadas
5. **Dado** que um paciente não tem um número de telefone válido, **Quando** o sistema tenta enviar confirmação, **Então** ele registra a falha e alerta a recepcionista

---

### História de Usuário 4 - Link Público de Agendamento (Prioridade: P2)

A clínica compartilha uma URL pública (ex: clinica.healthsync.com.br) onde pacientes podem visualizar horários disponíveis e agendar suas próprias consultas sem ligar. Pacientes selecionam o profissional, veem disponibilidade em tempo real e completam o agendamento com suas informações de contato.

**Por que esta prioridade**: Reduz carga de trabalho da recepcionista e permite agendamento 24/7. Aumenta conveniência do paciente, mas clínica pode operar sem isso usando agendamento manual P1.

**Teste Independente**: Pode ser totalmente testado compartilhando o link público, tendo usuários de teste agendando consultas em vários horários, verificando se horários aparecem imediatamente na agenda da recepcionista e confirmando que não ocorrem conflitos. Entrega valor através da redução de volume de ligações.

**Cenários de Aceitação**:

1. **Dado** que um paciente visita a página pública de agendamento da clínica, **Quando** ele seleciona um profissional e data, **Então** ele vê todos os horários disponíveis para aquele dia
2. **Dado** que um paciente seleciona um horário disponível, **Quando** ele insere suas informações de contato e confirma, **Então** a consulta é criada e aparece na agenda da recepcionista em até 5 segundos
3. **Dado** que dois pacientes tentam agendar o mesmo horário simultaneamente, **Quando** o primeiro paciente completa o agendamento, **Então** o segundo paciente vê que o horário não está mais disponível
4. **Dado** que a clínica fecha para feriados, **Quando** a recepcionista marca essas datas como indisponíveis, **Então** pacientes não podem agendar consultas nessas datas via link público
5. **Dado** que um paciente agenda uma consulta online, **Quando** o agendamento é bem-sucedido, **Então** ele recebe confirmação imediata via WhatsApp ou email

---

### História de Usuário 5 - Painel em Tempo Real para Recepcionista (Prioridade: P2)

A recepcionista visualiza um painel mostrando a agenda de hoje com consultas próximas, chegadas recentes de pacientes, alertas de falta e pacientes aguardando. O painel atualiza em tempo real conforme consultas são confirmadas, pacientes chegam ou cancelamentos ocorrem.

**Por que esta prioridade**: Melhora eficiência operacional diária e gestão de fluxo de pacientes. Valioso, mas clínica pode funcionar com visualização básica de agenda (P1).

**Teste Independente**: Pode ser totalmente testado tendo múltiplos eventos simulados de consulta (confirmações, chegadas, cancelamentos) ocorrendo e verificando se o painel atualiza em até 3 segundos sem atualização manual. Entrega valor através da redução de carga cognitiva da recepcionista.

**Cenários de Aceitação**:

1. **Dado** que a recepcionista abre o painel no início do dia, **Quando** visualizando a agenda de hoje, **Então** todas as consultas são exibidas cronologicamente com nomes dos pacientes e status
2. **Dado** que um paciente chega, **Quando** a recepcionista marca como presente, **Então** o status da consulta atualiza e aparece na seção "Pacientes Atuais"
3. **Dado** que múltiplos profissionais estão trabalhando, **Quando** visualizando o painel, **Então** consultas são agrupadas por profissional com código de cores
4. **Dado** que pacientes confirmam ou cancelam via WhatsApp, **Quando** sua resposta é recebida, **Então** o painel reflete o status atualizado em até 5 segundos sem recarregar a página
5. **Dado** que o horário de uma consulta passou sem check-in do paciente, **Quando** 15 minutos após o horário agendado decorre, **Então** a consulta é sinalizada como potencial falta

---

### História de Usuário 6 - Gestão de Assinatura e Cobrança (Prioridade: P1)

O administrador da clínica gerencia sua assinatura, visualiza detalhes do plano atual, faz upgrade/downgrade entre níveis e monitora uso (confirmações WhatsApp enviadas, quantidade de consultas). O sistema processa pagamentos, exibe histórico de cobranças e aplica limites do plano.

**Por que esta prioridade**: Sem modelo de receita = sem negócio sustentável. Isso é crítico para monetização e deve estar presente desde o lançamento do MVP para validar disposição para pagar.

**Teste Independente**: Pode ser totalmente testado assinando um plano, processando pagamento via PIX/cartão de crédito, recebendo confirmação, usando o serviço dentro dos limites do plano, atingindo limites de uso e verificando se prompts de upgrade aparecem. Entrega validação de negócio do modelo de precificação.

**Cenários de Aceitação**:

1. **Dado** que uma nova clínica se cadastra, **Quando** ela seleciona um nível de assinatura durante o onboarding, **Então** ela pode completar pagamento via cartão de crédito ou PIX e imediatamente acessar a plataforma
2. **Dado** que uma clínica está no plano Básico, **Quando** ela excede 500 confirmações WhatsApp em um mês, **Então** o sistema para de enviar confirmações e solicita upgrade ou cobra taxa por mensagem
3. **Dado** um administrador de clínica, **Quando** ele visualiza seu painel de assinatura, **Então** ele vê plano atual, data do ciclo de cobrança, medidores de uso (confirmações enviadas, consultas criadas) e histórico de pagamentos
4. **Dado** que uma clínica quer fazer upgrade, **Quando** ela seleciona um nível superior, **Então** a mudança tem efeito imediato com ajuste de cobrança proporcional
5. **Dado** que o pagamento falha, **Quando** a data de cobrança chega, **Então** o sistema envia notificação por email, tenta novamente após 3 dias e restringe funcionalidades se pagamento falhar após 7 dias

---

### História de Usuário 7 - Painel de Analytics e ROI para Dono da Clínica (Prioridade: P2)

O dono da clínica (tomador de decisão que paga pela assinatura) visualiza analytics de negócio mostrando utilização da agenda, tendências de taxa de falta, receita recuperada através de confirmações e melhorias mês-a-mês. Isso demonstra o valor da plataforma e impulsiona retenção.

**Por que esta prioridade**: Crítico para retenção - clínicas cancelam se não veem ROI mensurável. Porém, plataforma pode lançar sem isso se testes beta provarem valor através de relatórios manuais.

**Teste Independente**: Pode ser totalmente testado simulando 60 dias de consultas (com/sem confirmações), gerando analytics mostrando 35% de redução de faltas, calculando receita economizada (valor médio de consulta × faltas prevenidas) e verificando se gráficos visuais renderizam corretamente. Entrega valor de retenção.

**Cenários de Aceitação**:

1. **Dado** que um dono de clínica faz login, **Quando** ele visualiza o painel de analytics, **Então** ele vê porcentagem de falta do mês atual, comparação com mês anterior e impacto projetado na receita
2. **Dado** que existem 30 dias de dados de consultas, **Quando** visualizando relatório de utilização da agenda, **Então** o sistema mostra porcentagem de horários disponíveis preenchidos por profissional com tendências semanais
3. **Dado** que confirmações WhatsApp estão ativas há 60 dias, **Quando** visualizando o relatório de ROI, **Então** o sistema exibe taxa de falta antes/depois da automação com receita estimada recuperada
4. **Dado** que múltiplos profissionais trabalham na clínica, **Quando** comparando performance, **Então** o dono vê volume de consultas, taxas de falta e métricas de utilização por profissional
5. **Dado** que o dono quer relatórios mensais, **Quando** o ciclo de cobrança termina, **Então** o sistema envia automaticamente por email um resumo das métricas principais

---

### História de Usuário 8 - Acesso a Suporte para Clínicas (Prioridade: P2)

A equipe da clínica acessa suporte através de chat no app, email ou WhatsApp durante horário comercial definido. Equipe de suporte responde dentro dos prazos de SLA baseados no nível de assinatura. Problemas comuns são abordados através de documentação de ajuda pesquisável e tutoriais em vídeo.

**Por que esta prioridade**: Feedback de parceiros indica que saúde requer suporte próximo. Suporte ruim = alta taxa de churn. Porém, MVP pode lançar apenas com suporte via email para validar demanda antes de investir em chat em tempo real.

**Teste Independente**: Pode ser totalmente testado submetendo solicitações de suporte via cada canal, medindo tempos de resposta, escalando problemas e verificando se documentação de ajuda é pesquisável e completa. Entrega valor de retenção através de satisfação.

**Cenários de Aceitação**:

1. **Dado** que uma recepcionista encontra um problema, **Quando** ela clica no ícone de ajuda, **Então** ela pode pesquisar documentação, assistir tutoriais em vídeo ou submeter um ticket de suporte
2. **Dado** que uma clínica está no plano Pro, **Quando** ela submete uma solicitação de suporte durante horário comercial (Seg-Sex 8h - 18h horário de Brasília), **Então** ela recebe resposta inicial em até 2 horas
3. **Dado** que uma clínica está no plano Básico, **Quando** ela submete uma solicitação de suporte, **Então** ela recebe resposta em até 24 horas via email
4. **Dado** que um bug crítico afeta agendamento, **Quando** sinalizado como urgente, **Então** equipe de suporte escala e responde em até 30 minutos independente do nível do plano
5. **Dado** que uma nova funcionalidade é lançada, **Quando** clínicas fazem login, **Então** elas veem um anúncio no app com link para tutorial em vídeo

---

### Casos Extremos

- O que acontece quando um paciente tenta agendar uma consulta com menos de 2 horas de antecedência através do link público? (O sistema deve permitir agendamentos imediatos ou impor tempo mínimo de antecedência?)
- Como o sistema lida com profissionais que trabalham horários irregulares ou precisam bloquear tempo para emergências?
- O que acontece quando uma clínica quer excluir permanentemente um registro de paciente versus arquivá-lo para conformidade?
- Como o sistema previne que um paciente agende múltiplas consultas sobrepostas com diferentes profissionais?
- O que acontece se a API do WhatsApp ficar temporariamente indisponível durante horário de pico de confirmações?
- Como a recepcionista lida com pacientes que chegam sem agendamento e precisam de consultas imediatas?
- O que acontece quando uma clínica atinge seu limite de consultas incluídas no mês?

## Requisitos _(obrigatório)_

### Requisitos Funcionais

- **RF-001**: Sistema DEVE permitir recepcionista criar consultas selecionando profissional, data, hora e paciente
- **RF-002**: Sistema DEVE exibir agendas de todos os profissionais em visualização unificada com habilidade de filtrar por profissional individual
- **RF-003**: Sistema DEVE prevenir agendamento duplo de horários para o mesmo profissional
- **RF-004**: Sistema DEVE permitir recepcionista cadastrar novos pacientes com nome, telefone, data de nascimento e ID de prontuário opcional
- **RF-005**: Sistema DEVE fornecer funcionalidade de busca de pacientes por nome, telefone ou ID de prontuário com correspondência parcial
- **RF-006**: Sistema DEVE permitir recepcionista atualizar informações existentes de pacientes
- **RF-007**: Sistema DEVE enviar mensagens automáticas de confirmação via WhatsApp 24 horas antes de consultas agendadas usando API oficial do WhatsApp Business
- **RF-008**: Sistema DEVE processar respostas de pacientes (confirmar/cancelar) do WhatsApp e atualizar status da consulta adequadamente
- **RF-009**: Sistema DEVE fornecer uma URL pública de agendamento onde pacientes podem visualizar horários disponíveis e auto-agendar consultas
- **RF-010**: Sistema DEVE atualizar disponibilidade da agenda em tempo real quando consultas são agendadas via link público
- **RF-011**: Sistema DEVE permitir recepcionista marcar datas como indisponíveis para consultas (feriados, ausências de profissionais)
- **RF-012**: Sistema DEVE exibir painel em tempo real mostrando consultas de hoje, status de check-in de pacientes e alertas de falta
- **RF-013**: Sistema DEVE permitir recepcionista marcar pacientes como presentes quando chegam
- **RF-014**: Sistema DEVE automaticamente sinalizar consultas como potenciais faltas após [PRECISA ESCLARECIMENTO: limite de tempo não especificado - sugestão 15 minutos após horário agendado]
- **RF-015**: Sistema DEVE suportar múltiplas localizações de clínica sob mesma conta com habilidade de gerenciar profissionais entre localizações
- **RF-016**: Sistema DEVE permitir recepcionista reagendar consultas existentes para horários diferentes ou profissionais diferentes
- **RF-017**: Sistema DEVE permitir recepcionista cancelar consultas e opcionalmente notificar paciente via WhatsApp
- **RF-018**: Sistema DEVE persistir todos os dados de consultas e pacientes de forma confiável
- **RF-019**: Sistema DEVE fornecer interface responsiva para mobile utilizável em tablets e telefones
- **RF-020**: Sistema DEVE suportar campo de observações em consultas para recepcionistas adicionarem informações contextuais
- **RF-021**: Sistema DEVE aplicar horário comercial específico da clínica para agendamento de consultas
- **RF-022**: Sistema DEVE permitir administrador da clínica configurar durações padrão de consulta por profissional (ex: 30min, 45min, 60min)
- **RF-023**: Sistema DEVE enviar confirmação de agendamento aos pacientes imediatamente após recepcionista criar consulta ou paciente auto-agendar
- **RF-024**: Sistema DEVE suportar gestão de assinatura com processamento de pagamento via cartão de crédito e PIX (pagamento instantâneo brasileiro)
- **RF-025**: Sistema DEVE aplicar limites de plano baseados no nível de assinatura (cota de mensagens WhatsApp, quantidade de profissionais, acesso a funcionalidades)
- **RF-026**: Sistema DEVE exibir medidores de uso mostrando recursos consumidos (confirmações enviadas, consultas criadas) contra limites do plano
- **RF-027**: Sistema DEVE permitir administrador da clínica fazer upgrade, downgrade ou cancelar assinatura com restrições de acesso apropriadas
- **RF-028**: Sistema DEVE gerar relatórios de analytics mostrando porcentagem de utilização da agenda por profissional
- **RF-029**: Sistema DEVE rastrear taxa de falta ao longo do tempo e exibir tendências antes/depois quando confirmações estão habilitadas
- **RF-030**: Sistema DEVE calcular impacto estimado na receita baseado em faltas prevenidas (usando valor médio de consulta definido pela clínica)
- **RF-031**: Sistema DEVE fornecer documentação de ajuda no app com funcionalidade de busca
- **RF-032**: Sistema DEVE permitir usuários submeterem tickets de suporte com níveis de prioridade
- **RF-033**: Sistema DEVE obter consentimento explícito do paciente para comunicações via WhatsApp em conformidade com LGPD
- **RF-034**: Sistema DEVE criptografar todos os dados de pacientes em repouso e em trânsito
- **RF-035**: Sistema DEVE fornecer funcionalidade de exportação de dados para pacientes solicitando suas informações pessoais (direito de acesso LGPD)
- **RF-036**: Sistema DEVE permitir administradores de clínica excluírem permanentemente registros de pacientes com workflow de confirmação (direito ao esquecimento LGPD)
- **RF-037**: Sistema DEVE registrar todos os acessos a dados sensíveis de pacientes para propósitos de trilha de auditoria
- **RF-038**: Sistema DEVE exibir termos de serviço e política de privacidade claros durante cadastro da clínica com aceitação obrigatória
- **RF-039**: Sistema DEVE implementar timeout de sessão após 30 minutos de inatividade para segurança
- **RF-040**: Sistema DEVE requerer senhas fortes para contas de usuário (mínimo 8 caracteres, maiúsculas/minúsculas, números)
- **RF-041**: Sistema DEVE enviar notificação por email aos administradores quando pagamento falhar com cronograma de novas tentativas
- **RF-042**: Sistema DEVE degradar funcionalidade WhatsApp graciosamente quando API estiver temporariamente indisponível, enfileirando mensagens para nova tentativa
- **RF-043**: Sistema DEVE permitir administradores de clínica definirem valor médio de consulta para propósitos de cálculo de ROI

### Níveis de Assinatura & Monetização

A plataforma oferece precificação em níveis para atender diferentes tamanhos de clínicas e necessidades enquanto cobre custos operacionais (particularmente despesas da API do WhatsApp):

**Plano Básico - R$197/mês**:

- Até 3 profissionais de saúde
- Agendamento ilimitado de consultas
- Gestão de pacientes
- Link público de agendamento
- 500 confirmações WhatsApp incluídas por mês
- Suporte por email (SLA de resposta em 24 horas)
- Interface responsiva para mobile

**Plano Profissional - R$397/mês**:

- Até 10 profissionais de saúde
- Todas as funcionalidades do plano Básico
- 2.000 confirmações WhatsApp incluídas por mês
- Painel em tempo real
- Analytics básicos (utilização da agenda, rastreamento de faltas)
- Suporte via chat no app (SLA de resposta em 2 horas durante horário comercial)
- Múltiplas localizações de clínica

**Plano Enterprise - Precificação customizada**:

- Profissionais ilimitados
- Todas as funcionalidades do plano Profissional
- Confirmações WhatsApp ilimitadas
- Analytics avançados de ROI com rastreamento de receita
- Suporte prioritário (resposta em 30 minutos para problemas críticos)
- Integrações customizadas
- Gerente de conta dedicado

**Uso Adicional**:

- Confirmações WhatsApp extras: R$0,50 por mensagem (cobre custo da API + margem)
- Localizações adicionais de clínica (plano Básico): R$50/mês cada

**Justificativa**: Estrutura de preços considera custos da API do WhatsApp Business (~R$0,20-0,30 por mensagem) enquanto mantém margens saudáveis. Cotas de mensagens previnem custos descontrolados enquanto permitem cobrança previsível.

### Entidades Principais

- **Clínica**: Representa a prática de saúde que assina a plataforma. Inclui nome da clínica, informações de contato, horário comercial, nível de assinatura e fuso horário (específico do Brasil). Uma clínica pode ter múltiplas localizações.
- **Profissional**: Profissionais de saúde que fornecem serviços na clínica (médicos, dentistas, fisioterapeutas, etc.). Inclui nome, especialidade, horário de trabalho, duração padrão de consulta e associação com localização(ões) específica(s) da clínica. Uma clínica tem 2-10 profissionais.
- **Paciente**: Indivíduos que agendam consultas na clínica. Inclui nome, data de nascimento, telefone (para WhatsApp), email (opcional), ID de prontuário (opcional) e data de criação. Pacientes são compartilhados entre todos os profissionais dentro de uma clínica.
- **Consulta**: Um horário agendado vinculando um paciente a um profissional. Inclui data, hora de início, hora de término, profissional, paciente, status (agendada/confirmada/check-in/concluída/falta/cancelada), observações, timestamp de criação e timestamp de confirmação.
- **Localização**: Local físico da clínica onde consultas ocorrem. Inclui endereço, nome e profissionais associados. Relevante para clínicas multi-localização.
- **Evento de Status de Consulta**: Registro histórico de mudanças de status (agendada → confirmada → check-in). Rastreia quem fez a mudança e quando para trilha de auditoria.
- **Assinatura**: Representa o plano de pagamento da clínica e direitos. Inclui nível (Básico/Profissional/Enterprise), data de início do ciclo de cobrança, método de pagamento, status (ativa/atrasada/cancelada), contadores de uso (mensagens WhatsApp enviadas neste ciclo, quantidade atual de profissionais) e histórico de cobranças.
- **Ticket de Suporte**: Uma solicitação de ajuda submetida pela equipe da clínica. Inclui descrição do problema, nível de prioridade, status (aberto/em_progresso/resolvido), timestamp de criação, agente de suporte atribuído e notas de resolução.
- **Snapshot de Analytics**: Cálculo periódico de métricas chave de negócio para uma clínica. Inclui intervalo de datas, total de consultas agendadas, total de consultas concluídas, quantidade de faltas, porcentagem de faltas, utilização da agenda por profissional e impacto estimado na receita.
- **Entrada de Log de Auditoria**: Registro de ações relevantes para segurança para conformidade. Inclui timestamp, usuário que performou ação, tipo de ação (acesso/modificação/exclusão de dados), registro de paciente afetado e endereço IP.
- **Registro de Consentimento do Paciente**: Documenta concordância do paciente com comunicações via WhatsApp. Inclui paciente, timestamp de consentimento concedido, método de consentimento (verbal/escrito) e timestamp de revogação se aplicável.

## Premissas de Negócio & Necessidades de Validação _(obrigatório)_

### Premissas Validadas

- Clínicas pequenas/médias (2-10 profissionais) lutam com caos de agendamento manual
- Faltas causam perda significativa de receita para clínicas de saúde brasileiras
- Clínicas estão dispostas a pagar R$200-400/mês por automação de agendamento
- WhatsApp é o canal de comunicação dominante para pacientes no Brasil

### Premissas Requerendo Validação

- **Aceitação de preços**: Precisa de 15-20 entrevistas de descoberta de clientes para confirmar disposição para pagar nos pontos de preço propostos
- **Sustentabilidade de custo WhatsApp**: Modelo assume média de 250 confirmações por clínica por mês. Precisa de dados beta para validar padrões reais de uso
- **Complexidade de onboarding**: Spec assume 2-4 horas para onboarding realista. Precisa de testes com usuários para validar suficiência de materiais de treinamento
- **Taxa de churn**: Modelo de negócio assume 3-5% de churn mensal. Precisa rastreamento de cohort beta para validar retenção
- **Carga de suporte**: Assume 2-3 tickets de suporte por clínica por mês. Precisa de dados operacionais para validar dimensionamento da equipe de suporte

### Passos Críticos de Validação Antes do Desenvolvimento Completo

1. **Teste de landing page**: Rodar R$1.000-2.000 em anúncios Google direcionando "software agendamento clínica" para medir qualidade de leads e intenção de conversão
2. **Compromisso de parceiros beta**: Garantir 3-5 clínicas dispostas a usar plataforma gratuitamente por 6 meses em troca de feedback semanal
3. **Deep-dive em concorrentes**: Analisar reviews de clientes Doctoralia/iClinic no G2/Capterra para identificar gaps de funcionalidades e oportunidades de diferenciação
4. **Verificação de custo da API WhatsApp**: Testar custos reais de mensagens com conta sandbox para validar premissa de R$0,20-0,30 por mensagem
5. **Entrevistas de validação de preços**: Apresentar níveis de preços para 15-20 clínicas prospectivas e avaliar reação (muito caro, razoável, barato)

## Critérios de Sucesso _(obrigatório)_

### Resultados de Experiência do Usuário

- **CS-001**: Recepcionista pode agendar uma nova consulta (incluindo busca ou cadastro de paciente) em menos de 90 segundos
- **CS-002**: Paciente pode completar agendamento auto-atendimento via link público em menos de 3 minutos
- **CS-003**: Sistema suporta 10 recepcionistas concorrentes gerenciando consultas sem degradação de performance
- **CS-004**: Atualizações da agenda aparecem para todos os usuários em até 5 segundos após criação ou modificação de consulta
- **CS-005**: 95% das mensagens automáticas de confirmação WhatsApp são entregues com sucesso em até 1 minuto do horário agendado de envio
- **CS-006**: Busca de paciente retorna resultados em menos de 1 segundo para bancos de dados de até 10.000 registros de pacientes
- **CS-007**: Sistema mantém 99,5% de uptime durante horário comercial das clínicas (Segunda-Sexta, 7h - 20h horário de Brasília)
- **CS-008**: Sistema previne 100% das tentativas de agendamento duplo com mensagens de erro claras
- **CS-009**: Interface mobile suporta todas as funções principais de agendamento (visualizar agenda, agendar consulta, fazer check-in de paciente) em dispositivos com telas de até 375px de largura

### Resultados de Negócio & Retenção

- **CS-010**: Clínicas reduzem taxa de falta em consultas em pelo menos 30% dentro de 60 dias usando confirmações automáticas
- **CS-011**: 80% das clínicas completam pagamento de assinatura dentro da primeira sessão de onboarding (valida aceitação de preços)
- **CS-012**: Taxa de churn mensal permanece abaixo de 5% após primeiros 3 meses de operação
- **CS-013**: 90% dos administradores de clínicas visualizam painel de analytics de ROI pelo menos uma vez por mês
- **CS-014**: Valor vitalício médio do cliente (LTV) excede 18 meses de receita de assinatura (R$3.546+ para plano Básico)
- **CS-015**: Volume de tickets de suporte tem média abaixo de 3 tickets por clínica por mês
- **CS-016**: 85% dos tickets de suporte são resolvidos dentro dos prazos de SLA publicados para cada nível
- **CS-017**: Net Promoter Score (NPS) de administradores de clínicas atinge 40+ dentro de 6 meses do lançamento

### Resultados de Onboarding & Adoção

- **CS-018**: 70% das novas clínicas agendam sua primeira consulta real de paciente dentro de 4 horas da criação da conta
- **CS-019**: Clínicas completam onboarding completo (criação de conta, configuração de profissionais, primeira consulta) dentro de 2-4 horas incluindo treinamento
- **CS-020**: 60% das clínicas habilitam confirmações WhatsApp dentro da primeira semana de uso
- **CS-021**: 90% das recepcionistas completam com sucesso primeiro agendamento de consulta sem assistência de suporte após assistir tutorial de onboarding

### Resultados de Validação de Go-to-Market

- **CS-022**: Teste de landing page gera pelo menos 30 leads qualificados de R$2.000 de gasto em anúncios (valida demanda)
- **CS-023**: Outreach por email para 50 clínicas alcança taxa de resposta de 10%+ para solicitações de demo (valida ressonância do problema)
- **CS-024**: 3-5 clínicas parceiras beta permanecem engajadas pelo período completo de compromisso de 6 meses (valida product-market fit)
- **CS-025**: Custo de Aquisição de Cliente (CAC) permanece abaixo de R$800 por clínica pagante dentro dos primeiros 6 meses
