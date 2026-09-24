import React, { useState } from 'react';
import { Button, TextArea, TextInput } from '@carbon/react';
import { openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { usePrivileges } from './privileges.resource';
import PrivilegeList from './privilege-list.component';

const Root: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { privileges, isLoading, error, mutate } = usePrivileges();

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
      mutate(); // reload the table so the new privilege appears
    } catch (err) {
      const response = err as { responseBody?: { error?: { message?: string } } };
      const message = response.responseBody?.error?.message ?? String(err);
      showSnackbar({ title: 'Could not create privilege', subtitle: message, kind: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Privilege Manager</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', marginBottom: '3rem' }}>
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
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create privilege'}
        </Button>
      </form>

      <h3 style={{ marginBottom: '1rem' }}>All privileges</h3>
      <PrivilegeList privileges={privileges} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Root;
