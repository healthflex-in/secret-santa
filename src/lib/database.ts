import { supabase } from './supabase';

export interface Assignment {
  giver: string;
  receiver: string;
}

export interface ViewerLogEntry {
  name: string;
  receiver: string;
  viewedAt: string;
}

// Database operations for Secret Santa data
export const database = {
  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('giver');
    
    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
    
    return data || [];
  },

  async saveAssignments(assignments: Assignment[]): Promise<boolean> {
    // First, delete all existing assignments (using a condition that matches all rows)
    const { error: deleteError } = await supabase
      .from('assignments')
      .delete()
      .neq('id', -1); // This will match all rows since IDs are always >= 0
    
    if (deleteError) {
      console.error('Error deleting existing assignments:', deleteError);
      // Continue anyway - might be empty table
    }
    
    // Then insert new assignments
    const { error } = await supabase
      .from('assignments')
      .insert(assignments);
    
    if (error) {
      console.error('Error saving assignments:', error);
      return false;
    }
    
    return true;
  },

  async clearAssignments(): Promise<boolean> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .neq('id', -1); // This will match all rows since IDs are always >= 0
    
    if (error) {
      console.error('Error clearing assignments:', error);
      return false;
    }
    
    return true;
  },

  // Participants
  async getParticipants(): Promise<string[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
    
    return data?.map(p => p.name) || [];
  },

  async saveParticipants(participants: string[]): Promise<boolean> {
    // First, delete all existing participants
    const { error: deleteError } = await supabase
      .from('participants')
      .delete()
      .neq('id', -1); // This will match all rows since IDs are always >= 0
    
    if (deleteError) {
      console.error('Error deleting existing participants:', deleteError);
      // Continue anyway - might be empty table
    }
    
    // Then insert new participants
    const participantsData = participants.map(name => ({ name }));
    const { error } = await supabase
      .from('participants')
      .insert(participantsData);
    
    if (error) {
      console.error('Error saving participants:', error);
      return false;
    }
    
    return true;
  },

  // Viewer Log
  async getViewerLog(): Promise<ViewerLogEntry[]> {
    const { data, error } = await supabase
      .from('viewer_log')
      .select('*')
      .order('viewed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching viewer log:', error);
      return [];
    }
    
    // Map database column names (snake_case) to interface (camelCase)
    return (data || []).map(item => ({
      name: item.name,
      receiver: item.receiver,
      viewedAt: item.viewed_at,
    }));
  },

  async addViewerLogEntry(entry: ViewerLogEntry): Promise<boolean> {
    // First, remove any existing entry for this name
    await supabase
      .from('viewer_log')
      .delete()
      .eq('name', entry.name);
    
    // Then insert the new entry (map camelCase to snake_case for database)
    const { error } = await supabase
      .from('viewer_log')
      .insert({
        name: entry.name,
        receiver: entry.receiver,
        viewed_at: entry.viewedAt,
      });
    
    if (error) {
      console.error('Error saving viewer log entry:', error);
      return false;
    }
    
    return true;
  },

  async clearViewerLog(): Promise<boolean> {
    const { error } = await supabase
      .from('viewer_log')
      .delete()
      .neq('id', -1); // This will match all rows since IDs are always >= 0
    
    if (error) {
      console.error('Error clearing viewer log:', error);
      return false;
    }
    
    return true;
  },

  // Admin Password
  async getAdminPassword(): Promise<string | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_password')
      .single();
    
    if (error) {
      console.error('Error fetching admin password:', error);
      return null;
    }
    
    return data?.setting_value || null;
  },

  async setAdminPassword(password: string): Promise<boolean> {
    // Use upsert to insert or update
    const { error } = await supabase
      .from('admin_settings')
      .upsert(
        {
          setting_key: 'admin_password',
          setting_value: password,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'setting_key',
        }
      );
    
    if (error) {
      console.error('Error saving admin password:', error);
      return false;
    }
    
    return true;
  },

  // Authorized Emails
  async getAuthorizedEmails(): Promise<{ email: string; name: string }[]> {
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('email, name')
      .order('email');
    
    if (error) {
      console.error('Error fetching authorized emails:', error);
      return [];
    }
    
    return data || [];
  },

  async isEmailAuthorized(email: string): Promise<{ authorized: boolean; name?: string }> {
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('name')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !data) {
      return { authorized: false };
    }
    
    return { authorized: true, name: data.name };
  },

  async addAuthorizedEmail(email: string, name: string): Promise<{ success: boolean; message?: string }> {
    // Use upsert to handle both insert and update
    const { error } = await supabase
      .from('authorized_emails')
      .upsert(
        {
          email: email.toLowerCase(),
          name: name,
        },
        {
          onConflict: 'email',
        }
      );
    
    if (error) {
      console.error('Error adding authorized email:', error);
      return { 
        success: false, 
        message: error.code === '23505' 
          ? 'Email already exists' 
          : error.message || 'Failed to add email' 
      };
    }
    
    return { success: true };
  },

  async removeAuthorizedEmail(email: string): Promise<boolean> {
    const { error } = await supabase
      .from('authorized_emails')
      .delete()
      .eq('email', email.toLowerCase());
    
    if (error) {
      console.error('Error removing authorized email:', error);
      return false;
    }
    
    return true;
  },

  async bulkAddAuthorizedEmails(emails: { email: string; name: string }[]): Promise<boolean> {
    const emailsData = emails.map(e => ({
      email: e.email.toLowerCase(),
      name: e.name,
    }));
    
    const { error } = await supabase
      .from('authorized_emails')
      .upsert(emailsData, {
        onConflict: 'email',
      });
    
    if (error) {
      console.error('Error bulk adding authorized emails:', error);
      return false;
    }
    
    return true;
  },
};

