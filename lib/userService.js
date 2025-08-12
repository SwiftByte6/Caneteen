import { supabase } from './supabaseClient';



export async function getUserProfile(userId) {
  if (!userId) {
    console.error('No userId provided to getUserProfile');
    return null;
  }

  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return null;
  }
}


export async function isUserAdmin(userId) {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
