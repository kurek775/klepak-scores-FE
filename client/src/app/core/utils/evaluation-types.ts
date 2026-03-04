import { EvaluationType } from '../models/activity.model';

export const EVALUATION_TYPES: { value: EvaluationType; key: string }[] = [
  { value: EvaluationType.NUMERIC_HIGH, key: 'EVENTS.NUMERIC_HIGH' },
  { value: EvaluationType.NUMERIC_LOW,  key: 'EVENTS.NUMERIC_LOW'  },
  { value: EvaluationType.BOOLEAN,      key: 'EVENTS.BOOLEAN'      },
  { value: EvaluationType.SCORE_SET,    key: 'EVENTS.SCORE_SET'    },
];

export function getEvalTypeKey(type: EvaluationType): string {
  return EVALUATION_TYPES.find(t => t.value === type)?.key ?? type;
}
