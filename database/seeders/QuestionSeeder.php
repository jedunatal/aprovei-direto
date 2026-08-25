<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Difficulty;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\Option;
use App\Models\Question;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Disciplinas
        $disciplinesData = [
            'Tecnologia da Informação' => ['Engenharia de Software', 'Banco de Dados', 'Redes de Computadores'],
            'Enfermagem' => ['Saúde Pública', 'Farmacologia Aplicada', 'Urgência e Emergência'],
            'Língua Portuguesa' => ['Sintaxe da Oração', 'Concordância Verbal e Nominal', 'Interpretação de Texto'],
            'Raciocínio Lógico Matemático' => ['Lógica Proposicional', 'Probabilidade', 'Análise Combinatória'],
        ];

        $topicMap = [];

        foreach ($disciplinesData as $disciplineName => $topics) {
            $discipline = Discipline::firstOrCreate(
                ['slug' => Str::slug($disciplineName)],
                ['name' => $disciplineName, 'is_active' => true]
            );

            foreach ($topics as $topicName) {
                $topic = Topic::firstOrCreate(
                    ['discipline_id' => $discipline->id, 'slug' => Str::slug($topicName)],
                    ['name' => $topicName, 'is_active' => true]
                );

                $topicMap[$disciplineName . ':' . $topicName] = $topic;
            }
        }

        // 2. Bancas Examinadoras
        $bancas = ['Cebraspe', 'FGV', 'FCC', 'Vunesp', 'IBFC', 'AOCP'];
        $bancaMap = [];

        foreach ($bancas as $banca) {
            $bancaMap[$banca] = Institution::firstOrCreate(
                ['slug' => Str::slug($banca)],
                ['name' => $banca, 'is_active' => true]
            );
        }

        // 3. Questão de Teste 1 (TI - Engenharia de Software - FGV)
        $tiTopic = $topicMap['Tecnologia da Informação:Engenharia de Software'];
        $fgv = $bancaMap['FGV'];

        $q1 = Question::create([
            'discipline_id' => $tiTopic->discipline_id,
            'topic_id' => $tiTopic->id,
            'institution_id' => $fgv->id,
            'year' => 2026,
            'difficulty' => Difficulty::Medium,
            'statement' => 'No contexto de arquitetura de microsserviços, qual padrão é utilizado para coordenar transações distribuídas e garantir a consistência eventual através de uma sequência de transações locais e transações de compensação?',
            'explanation' => 'O padrão Saga coordena transações entre múltiplos microsserviços usando mensagens/eventos e transações de compensação em caso de falha.',
            'is_active' => true,
        ]);

        $options1 = [
            ['letter' => 'A', 'text' => 'Circuit Breaker'],
            ['letter' => 'B', 'text' => 'Saga Pattern'],
            ['letter' => 'C', 'text' => 'API Gateway'],
            ['letter' => 'D', 'text' => 'Event Sourcing'],
        ];

        $correctOptionId1 = null;
        foreach ($options1 as $opt) {
            $createdOpt = Option::create([
                'question_id' => $q1->id,
                'letter' => $opt['letter'],
                'text' => $opt['text'],
            ]);

            if ($opt['letter'] === 'B') {
                $correctOptionId1 = $createdOpt->id;
            }
        }

        $q1->update(['correct_option_id' => $correctOptionId1]);

        // 4. Questão de Teste 2 (Língua Portuguesa - Sintaxe - Cebraspe)
        $ptTopic = $topicMap['Língua Portuguesa:Sintaxe da Oração'];
        $cebraspe = $bancaMap['Cebraspe'];

        $q2 = Question::create([
            'discipline_id' => $ptTopic->discipline_id,
            'topic_id' => $ptTopic->id,
            'institution_id' => $cebraspe->id,
            'year' => 2026,
            'difficulty' => Difficulty::Easy,
            'statement' => 'Na oração "Precisa-se de novos programadores", o termo "de novos programadores" exerce a função sintática de:',
            'explanation' => 'O verbo "precisar" é transitivo indireto (quem precisa, precisa de algo). Acompanhado da partícula "se" (índice de indeterminação do sujeito), o termo regido por preposição atua como Objeto Indireto.',
            'is_active' => true,
        ]);

        $options2 = [
            ['letter' => 'A', 'text' => 'Sujeito Paciente'],
            ['letter' => 'B', 'text' => 'Objeto Direto'],
            ['letter' => 'C', 'text' => 'Objeto Indireto'],
            ['letter' => 'D', 'text' => 'Agente da Passiva'],
        ];

        $correctOptionId2 = null;
        foreach ($options2 as $opt) {
            $createdOpt = Option::create([
                'question_id' => $q2->id,
                'letter' => $opt['letter'],
                'text' => $opt['text'],
            ]);

            if ($opt['letter'] === 'C') {
                $correctOptionId2 = $createdOpt->id;
            }
        }

        $q2->update(['correct_option_id' => $correctOptionId2]);
    }
}