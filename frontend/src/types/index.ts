export type Result = {
  ml_probability: number;
  final_risk_score: number;
  risk_level: string;
  text_was_used: boolean;
  sentiment: { label: string; confidence: number; risk_signal: number };
  shap_explanation: {
    risk_increasing_factors: { feature: string; contribution: number }[];
    risk_decreasing_factors: { feature: string; contribution: number }[];
  };
};

export type Record = {
  id: string;
  createdAt?: { toDate: () => Date };
  input: {
    loan_amnt: string;
    int_rate: string;
    annual_inc: string;
    dti: string;
    open_acc: string;
    revol_util: string;
    borrower_text: string;
  };
  result: Result;
};

export const initialFormState = {
  loan_amnt: '12000',
  int_rate: '13.5',
  annual_inc: '55000',
  dti: '15',
  open_acc: '9',
  revol_util: '45',
  borrower_text: ''
};
