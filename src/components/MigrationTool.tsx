import { useCallback, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { createQuestionsCol } from '../api/questions';
import { createTemplate } from '../api/template';

interface RawCategory {
  name?: unknown;
  questions?: unknown;
  subCategories?: RawCategory[];
  topics?: RawCategory[];
}

interface TemplateExportFile {
  template?: {
    name?: unknown;
    categories?: RawCategory[];
  };
}

interface RawQuestion {
  _id?: unknown;
  id?: unknown;
  q?: unknown;
  choice?: unknown;
  qType?: unknown;
  required?: unknown;
  answer?: unknown;
}

interface QuestionsColExportFile {
  collections?: RawQuestionsCol[];
}

interface RawQuestionsCol {
  _id?: unknown;
  name?: unknown;
  description?: unknown;
  questions?: RawQuestion[];
}

interface NormalizedQuestion {
  [key: string]: unknown;
  q: string;
  choice: string[];
  qType: string;
  required: boolean;
  answer?: string;
}

interface NormalizedQuestionsCol {
  id: string;
  name: string;
  description?: string;
  questions: NormalizedQuestion[];
}

interface NormalizedTemplateCategory {
  name: string;
  questions: string[];
  subCategories?: NormalizedTemplateCategory[];
  topics?: NormalizedTemplateCategory[];
}

const qTypeMap: Record<string, string> = {
  Text: 'Text',
  Multiple: 'Multiple',
  Single: 'Single',
  Number: 'Number',
  טקסט: 'Text',
  'בחירה מרובה': 'Multiple',
  'בחירה יחידה': 'Single',
  מספר: 'Number',
};

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const extractAxiosMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const dataMessage = error.response?.data?.message;
    if (Array.isArray(dataMessage)) return dataMessage.join(', ');
    if (typeof dataMessage === 'string') return dataMessage;
    return error.message;
  }
  return (error as Error)?.message ?? 'Unknown error';
};

const normalizeQuestion = (question: RawQuestion, warnings: string[]): NormalizedQuestion | null => {
  const text = asString(question.q).trim();
  if (!text) {
    warnings.push('Skipped question with missing prompt');
    return null;
  }

  const rawType = asString(question.qType).trim();
  const qType = qTypeMap[rawType] ?? 'Text';
  if (!qTypeMap[rawType]) warnings.push(`Question "${text}" used unsupported type "${rawType}". Defaulted to Text.`);

  const choice = Array.isArray(question.choice)
    ? question.choice.filter((item): item is string => typeof item === 'string')
    : [];

  const required = typeof question.required === 'boolean' ? question.required : Boolean(question.required);

  const answer = typeof question.answer === 'string' && question.answer.trim().length > 0
    ? question.answer
    : undefined;

  return {
    q: text,
    choice,
    qType,
    required,
    answer,
  };
};

const normalizeQuestionsCol = (col: RawQuestionsCol, warnings: string[]): NormalizedQuestionsCol | null => {
  const id = asString(col._id).trim();
  const name = asString(col.name).trim();

  if (!id || !name) {
    warnings.push('Skipped question collection with missing id or name');
    return null;
  }

  const normalizedQuestions = (col.questions ?? [])
    .map((question) => normalizeQuestion(question, warnings))
    .filter((question): question is NormalizedQuestion => Boolean(question));

  return {
    id,
    name,
    description: asString(col.description).trim() || undefined,
    questions: normalizedQuestions,
  };
};

const normalizeCategories = (
  categories: RawCategory[] | undefined,
  idMap: Map<string, string>,
  warnings: string[],
): NormalizedTemplateCategory[] => {
  if (!categories) return [];

  return categories
    .map((category) => {
      const name = asString(category.name).trim();
      if (!name) {
        warnings.push('Ignored category without a name');
        return null;
      }

      const originalIds = Array.isArray(category.questions)
        ? category.questions.map((id) => asString(id).trim()).filter(Boolean)
        : [];

      const mappedIds = originalIds
        .map((id) => {
          const mapped = idMap.get(id);
          if (!mapped) warnings.push(`Missing remote collection for original id ${id} (category ${name})`);
          return mapped;
        })
        .filter((id): id is string => Boolean(id));

      return {
        name,
        questions: mappedIds,
        subCategories: normalizeCategories(category.subCategories, idMap, warnings),
        topics: normalizeCategories(category.topics, idMap, warnings),
      };
    })
    .filter((category): category is NormalizedTemplateCategory => Boolean(category));
};

const MigrationTool = () => {
  const [templateFile, setTemplateFile] = useState<TemplateExportFile | null>(null);
  const [questionColsFile, setQuestionColsFile] = useState<NormalizedQuestionsCol[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const appendLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, message]);
  }, []);

  const resetLogs = () => {
    setLogs([]);
    setIsProcessing(false);
  };

  const handleTemplateUpload = async (file: File) => {
    resetLogs();
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as TemplateExportFile;
      if (!parsed.template) throw new Error('Template payload missing "template" property');
      setTemplateFile(parsed);
      appendLog(`Loaded template file "${file.name}"`);
    } catch (error) {
      appendLog(`Failed to parse template file: ${extractAxiosMessage(error)}`);
    }
  };

  const handleQuestionsUpload = async (file: File) => {
    resetLogs();
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as QuestionsColExportFile;
      const warnings: string[] = [];
      const normalized = (parsed.collections ?? [])
        .map((col) => normalizeQuestionsCol(col, warnings))
        .filter((col): col is NormalizedQuestionsCol => Boolean(col));

      setQuestionColsFile(normalized);
      setSelectedIds(new Set(normalized.map((col) => col.id)));
      appendLog(`Loaded question collections file "${file.name}" (${normalized.length} collections)`);
      warnings.forEach(appendLog);
    } catch (error) {
      appendLog(`Failed to parse question collections file: ${extractAxiosMessage(error)}`);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCollections = useMemo(
    () => questionColsFile.filter((col) => selectedIds.has(col.id)),
    [questionColsFile, selectedIds],
  );

  const handleMigrate = async () => {
    if (!templateFile?.template) {
      appendLog('Cannot migrate without template data');
      return;
    }
    if (selectedCollections.length === 0) {
      appendLog('Select at least one question collection to migrate');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    appendLog('Starting migration…');

    const warnings: string[] = [];
    const idMap = new Map<string, string>();

    for (const col of selectedCollections) {
      try {
        const response = await createQuestionsCol(
          col.name,
          col.questions as unknown as Record<string, unknown>[],
          col.description,
        );
        const newId = (response.data?.id ?? response.data?._id) as string | undefined;
        if (!newId) {
          warnings.push(`Remote id missing for collection "${col.name}"`);
          continue;
        }
        idMap.set(col.id, newId);
        appendLog(`Created remote collection "${col.name}" → ${newId}`);
      } catch (error) {
        appendLog(`Failed to create collection "${col.name}": ${extractAxiosMessage(error)}`);
      }
    }

    const normalizedCategories = normalizeCategories(templateFile.template.categories, idMap, warnings);
    const sanitizedTemplate = {
      name: asString(templateFile.template.name).trim() || 'שאלון ללא שם',
      categories: normalizedCategories,
    };

    try {
      const response = await createTemplate({ template: sanitizedTemplate });
      appendLog(`Template created remotely with id ${response.data?.id ?? response.data?._id ?? 'unknown'}`);
    } catch (error) {
      appendLog(`Failed to create template: ${extractAxiosMessage(error)}`);
    }

    warnings.forEach(appendLog);
    setIsProcessing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      <h2>Template Migration Assistant</h2>

      <section>
        <p>Step 1. Upload the exported template JSON.</p>
        <input
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleTemplateUpload(file);
          }}
        />
      </section>

      <section>
        <p>Step 2. Upload the exported question collections JSON.</p>
        <input
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleQuestionsUpload(file);
          }}
        />
      </section>

      {questionColsFile.length > 0 && (
        <section>
          <h3>Select collections to migrate</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {questionColsFile.map((col) => (
              <li key={col.id} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(col.id)}
                    onChange={() => toggleSelection(col.id)}
                  />
                  <span>
                    {col.name}
                    {col.description ? ` – ${col.description}` : ''}
                    {` (${col.questions.length} שאלות)`}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" onClick={handleMigrate} disabled={isProcessing}>
        {isProcessing ? 'Migrating…' : 'Migrate to Remote'}
      </button>

      {logs.length > 0 && (
        <section>
          <h3>Activity log</h3>
          <ol>
            {logs.map((log, index) => (
              <li key={`${log}-${index}`}>{log}</li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3>Tips</h3>
        <ul>
          <li>Log in as admin before running the migration so API calls are authenticated.</li>
          <li>The tool posts to the API base configured in Vite (development points to the remote server).</li>
          <li>Re-run with the same files to retry failed collections; duplicates will raise backend validation errors.</li>
        </ul>
      </section>
    </div>
  );
};

export default MigrationTool;
