import React, { useState } from 'react';
import { Button, TextInput, TextArea } from '@carbon/react';
import { openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';

const Root: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showSnackbar({ title: 'Name is required', kind: 'warning' });
      return;
    }

    setSaving(true);
    try {
      await openmrsFetch(`${restBaseUrl}/privilege`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { name, description },
      });
      showSnackbar({ title: `Privilege "${name}" created`, kind: 'success' });
      setName('');
      setDescription('');
    } catch (error) {
      const message =
        (error as { responseBody?: { error?: { message?: string } } }).responseBody?.error?.message ?? String(error);
      showSnackbar({ title: 'Could not create privilege', subtitle: message, kind: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Privilege Manager</h2>
      <form onSubmit={handleSubmit}>
        <TextInput
          id="privilege-name"
          labelText="Privilege name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ margin: '1rem 0' }}>
          <TextArea
            id="privilege-description"
            labelText="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create privilege'}
        </Button>
      </form>
    </div>
  );
};

export default Root;
