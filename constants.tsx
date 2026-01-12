
import { SpecificationItem } from './types';

export const SPECIFICATIONS: SpecificationItem[] = [
  {
    id: 'entrada_guarita',
    category: 'Entrada',
    title: 'Guarita / Portaria',
    description: 'Controle de acesso e segurança da entrada.',
    requirements: [
      'Alvenaria or estrutura metálica resistente',
      'Visibilidade 360 graus para o fluxo de veículos',
      'Instalação elétrica e lógica funcional',
      'Banheiro exclusivo para o vigilante'
    ]
  },
  {
    id: 'entrada_portao_veiculos',
    category: 'Entrada',
    title: 'Portões de Veículos',
    description: 'Acessos para frota e caminhões.',
    requirements: [
      'Portões com abertura rápida (motorizados)',
      'Largura mínima para manobra de carretas',
      'Pintura em bom estado (preto ou padrão parceiro)',
      'Dispositivo de travamento de segurança'
    ]
  },
  {
    id: 'entrada_acesso_pedestres',
    category: 'Entrada',
    title: 'Acesso de Pedestres',
    description: 'Segregação de entrada de pessoas.',
    requirements: [
      'Acesso independente dos veículos',
      'Presença de catraca ou controle manual',
      'Iluminação reforçada na zona de triagem'
    ]
  },
  {
    id: 'fachada_cor',
    category: 'Identificação',
    title: 'Fachada (Padrão de Cores)',
    description: 'Padrão visual da fachada externa.',
    requirements: [
      'Faixa vermelha com 2 metros de altura (medido do chão)',
      'Restante da fachada na cor branca',
      'Uso de tinta acrílica'
    ]
  },
  {
    id: 'placa_identificacao',
    category: 'Identificação',
    title: 'Placa de Identificação',
    description: 'Identificação do parceiro e marca.',
    requirements: [
      'Placa com logo Solar Coca-Cola',
      'Logo do Distribuidor Logístico',
      'Dimensões conforme manual de marca'
    ]
  },
  {
    id: 'sanitarios',
    category: 'Instalações',
    title: 'Sanitários',
    description: 'Infraestrutura de higiene.',
    requirements: [
      'Proporção de 1 para cada 20 funcionários',
      'Separação por gênero',
      'Distância máxima de 120m do posto de trabalho',
      'Piso antiderrapante e ralos sifonados'
    ]
  },
  {
    id: 'sala_comercial',
    category: 'Instalações',
    title: 'Sala Comercial',
    description: 'Área administrativa e de suporte.',
    requirements: [
      'Presença de bebedouro interno funcional',
      'Iluminação adequada e eficiente',
      'Paredes pintadas na cor branca (Padrão Solar)',
      'Mobiliário ergonômico para a equipe comercial'
    ]
  },
  {
    id: 'sala_mkt',
    category: 'Instalações',
    title: 'Sala de Material de MKT',
    description: 'Armazenagem de itens de ativação e merchandising.',
    requirements: [
      'Localização próxima à sala comercial',
      'Possuir acesso interno seguro',
      'Presença de prateleiras para precificadores e banners',
      'Espaço organizado para itens de ativação de PDV'
    ]
  },
  {
    id: 'vestiarios',
    category: 'Instalações',
    title: 'Vestiários',
    description: 'Área de troca e bem-estar.',
    requirements: [
      'Bancos suficientes para a troca de turno',
      'Armários individuais',
      'Ventilação adequada'
    ]
  },
  {
    id: 'bebedouros',
    category: 'Instalações',
    title: 'Bebedouros',
    description: 'Acesso à água potável.',
    requirements: [
      'Água potável e fresca',
      'Área azulejada com ralo (se industrial)',
      'Proporção de 1 para 50 funcionários'
    ]
  },
  {
    id: 'piso_galpao',
    category: 'Galpão',
    title: 'Piso do Galpão',
    description: 'Qualidade do pavimento logístico.',
    requirements: [
      'Concreto industrial polido',
      'Sem cerâmica, paver ou paralelepípedo',
      'Capacidade de carga compatível with a operação'
    ]
  },
  {
    id: 'fechamento_vertical',
    category: 'Galpão',
    title: 'Fechamento Vertical',
    description: 'Segurança e isolamento lateral.',
    requirements: [
      'Fechamento total (sem aberturas)',
      'Estrutura em concreto pré-moldado ou metálica',
      'Sem telas como fechamento principal'
    ]
  },
  {
    id: 'cobertura',
    category: 'Galpão',
    title: 'Cobertura',
    description: 'Proteção superior contra intempéries.',
    requirements: [
      'Telhas metálicas ou fibrocimento (sem amianto)',
      'Ausência de goteiras e infiltrações'
    ]
  },
  {
    id: 'ventilacao',
    category: 'Galpão',
    title: 'Ventilação',
    description: 'Circulação de ar.',
    requirements: [
      'Ventilação cruzada ou forçada (exaustores)',
      'Conforto térmico para os colaboradores'
    ]
  },
  {
    id: 'elemento_vazado',
    category: 'Galpão',
    title: 'Elemento Vazado (Cobogós)',
    description: 'Aberturas para ventilação natural.',
    requirements: [
      'Presença de tela mosqueteira (malha fina)',
      'Bom estado de conservação sem quebras',
      'Vedação contra entrada de pássaros e roedores'
    ]
  },
  {
    id: 'manutencao_protecao',
    category: 'Galpão',
    title: 'Manutenção e Proteção',
    description: 'Planos de conservação e limpeza.',
    requirements: [
      'Plano de manutenção preventiva da estrutura',
      'Cronograma de limpeza e higienização do galpão',
      'Pintura e sinalização atualizadas'
    ]
  },
  {
    id: 'controle_pragas',
    category: 'Galpão',
    title: 'Controle de Pragas',
    description: 'Barreiras e métodos de controle sanitário.',
    requirements: [
      'Uso obrigatório de iscas em blocos no interior do CD',
      'Uso obrigatório de iscas granulares na parte externa',
      'Portas com vedação inferior (escovas ou rodos)',
      'Certificados de execução de desinsetização/desratização vigentes',
      'Mapeamento dos pontos de iscagem'
    ]
  },
  {
    id: 'iluminacao',
    category: 'Galpão',
    title: 'Iluminação',
    description: 'Níveis de iluminância operacional.',
    requirements: [
      '300 lux (áreas de estoque/extremidades)',
      '500 lux (áreas de picking/centro)',
      'Lâmpadas com proteção contra queda (se necessário)'
    ]
  },
  {
    id: 'bate_rodas',
    category: 'Galpão',
    title: 'Bate-rodas e Proteções',
    description: 'Segurança patrimonial e operacional.',
    requirements: [
      'Proteção em todas as colunas',
      'Proteção no perímetro interno',
      'Pintura amarela de segurança'
    ]
  },
  {
    id: 'eqs_armazenamento',
    category: 'Equipamentos (EQS)',
    title: 'Área de EQS',
    description: 'Armazenamento de Equipamentos de Mercado (Geladeiras/Racks).',
    requirements: [
      'Área coberta e protegida de sol e chuva',
      'Piso nivelado para evitar danos aos pés dos equipamentos',
      'Organização por tipo e modelo',
      'Acesso controlado para evitar furtos de peças'
    ]
  },
  {
    id: 'sucata_eqs',
    category: 'Equipamentos (EQS)',
    title: 'Sucata de EQS',
    description: 'Área para equipamentos inservíveis destinados a descarte.',
    requirements: [
      'Segregação física dos equipamentos bons',
      'Identificação clara como MATERIAL DE DESCARTE / SUCATA',
      'Área com contenção para possíveis vazamentos de fluidos'
    ]
  },
  {
    id: 'vasilhames_refpet',
    category: 'Vasilhames',
    title: 'Vasilhames REFPET',
    description: 'Armazenamento de garrafas retornáveis de plástico.',
    requirements: [
      'Empilhamento conforme normas de segurança (limite de altura)',
      'Separação por SKU e estado de conservação',
      'Área limpa e livre de resíduos que atraiam pragas'
    ]
  },
  {
    id: 'vasilhames_gerais',
    category: 'Vasilhames',
    title: 'Vasilhames Gerais',
    description: 'Vidros e outros vasilhames retornáveis do mix.',
    requirements: [
      'Paletização correta e segura',
      'Ausência de cacos de vidro no piso',
      'Organização que facilite o carregamento de retorno'
    ]
  },
  {
    id: 'sucata_geral',
    category: 'Operacional',
    title: 'Área de Sucata',
    description: 'Resíduos metálicos, plásticos e madeiras inservíveis.',
    requirements: [
      'Local específico afastado do estoque de produto acabado',
      'Piso concretado',
      'Organização por tipo de material (Metais, Plásticos, Madeiras)'
    ]
  },
  {
    id: 'oficina_manutencao',
    category: 'Operacional',
    title: 'Oficina e Manutenção de Veículos',
    description: 'Área técnica para reparo de frota e empilhadeiras.',
    requirements: [
      'Piso impermeabilizado com sistema de drenagem de óleo',
      'Presença de canaletas e caixa separadora (SAO)',
      'Organização de ferramentas e bancadas',
      'Ventilação exaustiva para gases'
    ]
  },
  {
    id: 'area_residuos',
    category: 'Ambiental',
    title: 'Área de Resíduos',
    description: 'Central de triagem e armazenamento temporário de lixo.',
    requirements: [
      'Coletores identificados conforme cores da coleta seletiva',
      'Área coberta e com piso lavável',
      'Controle de odores e acesso restrito',
      'Identificação de Resíduos Perigosos (Classe I)'
    ]
  },
  {
    id: 'armazenamento_materiais',
    category: 'Armazenamento',
    title: 'Armazenamento de Materiais',
    description: 'Estoque de materiais de consumo, limpeza e peças.',
    requirements: [
      'Prateleiras identificadas',
      'Separação de produtos químicos de outros materiais',
      'Organização que evite obstrução de corredores'
    ]
  },
  {
    id: 'produtos_nao_conformes',
    category: 'Armazenamento',
    title: 'Área de Produtos Não Conformes',
    description: 'Segregação de avarias, devoluções e bloqueados.',
    requirements: [
      'Área fisicamente isolada (gradeada ou fitada)',
      'Identificação visual clara (Placas de Não Conforme)',
      'Registro e rastreabilidade dos itens na área',
      'Limpeza rigorosa para evitar atrativos de pragas'
    ]
  },
  {
    id: 'caminho_seguro',
    category: 'Segurança',
    title: 'Caminho Seguro',
    description: 'Fluxo seguro de pedestres.',
    requirements: [
      'Largura mínima de 1,20m',
      'Cor azul no centro com faixas amarelas (15cm) laterais',
      'Presente em todo perímetro de tráfego'
    ]
  },
  {
    id: 'combate_incendio',
    category: 'Segurança',
    title: 'Sistema de Combate a Incêndio',
    description: 'Prevenção e combate conforme normas técnicas.',
    requirements: [
      'Extintores e hidrantes desobstruídos e sinalizados',
      'Validade das cargas e testes de mangueiras em dia',
      'Alarmes de incêndio e detectores de fumaça funcionais',
      'Iluminação de emergência e sinalização de rotas de fuga'
    ]
  },
  {
    id: 'esgoto_industrial',
    category: 'Ambiental',
    title: 'Esgoto Industrial',
    description: 'Gestão de líquidos não conformes.',
    requirements: [
      'Rede de esgoto industrial ou armazenamento em bombonas',
      'Recolhimento por empresa cadastrada'
    ]
  },
  {
    id: 'alcoolicos',
    category: 'Armazenamento',
    title: 'Alcoólicos',
    description: 'Área restrita para armazenamento de bebidas alcoólicas e itens de alto valor.',
    requirements: [
      'Cerca ou grade de proteção com altura mínima de 2,10m',
      'Fechamento superior (teto) se necessário para segurança total',
      'Controle de acesso rigoroso com chave ou biometria',
      'Sinalização de advertência e identificação de categoria',
      'Área exclusive para Alcoólicos e Itens de Alto Valor (Destilados)'
    ]
  },
  {
    id: 'alergênicos',
    category: 'Armazenamento',
    title: 'Produtos Alergênicos',
    description: 'Segregação para prevenção de contaminação cruzada.',
    requirements: [
      'Segregação física mínima (distância de segurança ou barreiras)',
      'Identificação visual específica nas posições de estoque (placas/adesivos)',
      'Proibição de armazenamento de produtos não alergênicos na mesma vertical',
      'Treinamento da equipe de picking sobre riscos de contaminação',
      'Protocolo de limpeza imediata em caso de avarias na área'
    ]
  },
  {
    id: 'produtos_alimenticios',
    category: 'Armazenamento',
    title: 'Produtos Alimentícios',
    description: 'Requisitos técnicos para armazenamento de balas, alimentos e itens sensíveis.',
    requirements: [
      'Produtos armazenados em sala isolada',
      'Uso de prateleiras metálicas',
      'Controle de acesso de pessoas à sala',
      'Ambiente climatizado',
      'Controle de pragas específico para a área',
      'Proibição total de contato direto dos produtos com o piso'
    ]
  },
  {
    id: 'area_picking',
    category: 'Armazenamento',
    title: 'Área de Picking',
    description: 'Zona de separação de pedidos fracionados.',
    requirements: [
      'Iluminação mínima de 500 lux direcionada',
      'Organização por endereçamento logístico visível',
      'Piso livre de obstáculos e em perfeito estado',
      'Bancadas de separação ergonômicas'
    ]
  },
  {
    id: 'area_reembalagem',
    category: 'Armazenamento',
    title: 'Área de Reembalagem',
    description: 'Processamento de itens avariados ou kits.',
    requirements: [
      'Bancada com superfície lavável e resistente',
      'Kit de primeiros socorros e EPIs específicos por perto',
      'Coleta seletiva para resíduos de embalagem (plástico/papel)',
      'Espaço para pesagem e selagem de volumes'
    ]
  },
  {
    id: 'glp_combustivel',
    category: 'Operacional',
    title: 'Central de GLP',
    description: 'Segurança de inflamáveis.',
    requirements: [
      'Local arejado com ventilação cruzada',
      'Distanciamentos mínimos conforme norma',
      'Extintores exclusivos para a área'
    ]
  },
  {
    id: 'posto_abastecimento',
    category: 'Operacional',
    title: 'Posto de Abastecimento',
    description: 'Abastecimento de empilhadeiras/frotas.',
    requirements: [
      'Bacia de contenção',
      'Piso impermeabilizado com calha de óleo',
      'Cobertura metálica obrigatória'
    ]
  },
  {
    id: 'legal_avcb',
    category: 'Legal',
    title: 'Licença: AVCB / CLCB',
    description: 'Auto de Vistoria do Corpo de Bombeiros.',
    requirements: [
      'Documento vigente e original (ou cópia autenticada) no local',
      'Vencimento em data futura'
    ]
  },
  {
    id: 'legal_sanitaria',
    category: 'Legal',
    title: 'Licença: Vigilância Sanitária',
    description: 'Licença de operação emitida pelo órgão de saúde.',
    requirements: [
      'Documento vigente compatível com a atividade de distribuição',
      'Exposição em local visível conforme norma'
    ]
  },
  {
    id: 'legal_ambiental',
    category: 'Legal',
    title: 'Licença: Licença Ambiental (LO)',
    description: 'Licença de Operação ambiental do empreendimento.',
    requirements: [
      'Documento vigente e sem pendências de condicionantes',
      'Compatibilidade com a atividade exercida'
    ]
  },
  {
    id: 'legal_alvara',
    category: 'Legal',
    title: 'Licença: Alvará de Funcionamento',
    description: 'Alvará municipal de localização e funcionamento.',
    requirements: [
      'Alvará vigente emitido pela prefeitura local',
      'Endereço e atividade corretos no documento'
    ]
  }
];
