import React, { useState } from 'react';
import AnimatedErrorMessage from '../AnimatedErrorMessage';
import '../CreateTemplate.css';
import TextInput from '../TextInput';
import SpinnerIcon from '../../assets/icons/SpinnerIcon';
import '../Button.css';

interface CreateNamesPopupProps {
  title: string;
  fieldLabel: string;
  addButtonText: string;
  primaryButtonText: string;
  duplicateErrorText: string;
  existingNames: string[];
  onClose: () => void;
  onCreate: (names: string[]) => void;
  saving?: boolean;
  savingText?: string;
}

const CreateNamesPopup: React.FC<CreateNamesPopupProps> = ({
  title,
  fieldLabel,
  addButtonText,
  primaryButtonText,
  duplicateErrorText,
  existingNames,
  onClose,
  onCreate,
  saving = false,
  savingText,
}) => {
  const [inputs, setInputs] = useState<{ name: string; error: string }[]>([
    { name: '', error: '' },
  ]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index].name = value;

    const trimmed = value.trim();
    const isDuplicateExisting = existingNames.includes(trimmed);
    const isDuplicateLocal = newInputs.some((inp, i) => i !== index && inp.name.trim() === trimmed);
    newInputs[index].error = trimmed && (isDuplicateExisting || isDuplicateLocal) ? duplicateErrorText : '';

    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { name: '', error: '' }]);
  };

  const removeInput = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const names = inputs.map((i) => i.name.trim()).filter(Boolean);
    if (names.length) {
      onCreate(names);
    }
  };

  const disablePrimary = saving || inputs.some((i) => i.error) || inputs.some((i) => !i.name.trim());

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{fieldLabel}</label>
            {inputs.map((input, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flexGrow: 1, marginRight: '10px' }}>
                    <TextInput
                      type="text"
                      value={input.name}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      required
                    />
                  </div>
                  {inputs.length > 1 && (
                    <button type="button" className="button-secondary" onClick={() => removeInput(index)}>
                      הסר
                    </button>
                  )}
                </div>
                <AnimatedErrorMessage message={input.error} />
              </div>
            ))}
          </div>
          <button type="button" className="button-secondary" onClick={addInput} style={{ marginBottom: '10px' }}>
            {addButtonText}
          </button>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose} disabled={saving}>
              ביטול
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={disablePrimary}
              aria-busy={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {saving && <SpinnerIcon size="sm" />}
              {saving && savingText ? savingText : primaryButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNamesPopup;
