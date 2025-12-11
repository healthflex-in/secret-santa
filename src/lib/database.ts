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
    // First, delete all existing assignments
    await supabase.from('assignments').delete().gte('id', 0);
    
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
      .gte('id', 0);
    
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
    await supabase.from('participants').delete().gte('id', 0);
    
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
      .gte('id', 0);
    
    if (error) {
      console.error('Error clearing viewer log:', error);
      return false;
    }
    
    return true;
  },
};
