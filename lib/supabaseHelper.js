import { supabase } from "./supabaseClient";

export const getAllItem = async () => {
  try {
    const { data, error } = await supabase
      .from("Items")
      .select("*");

    if (error) throw error;

    return data; // returns an array of items
  } catch (err) {
    console.error("Error fetching Items:", err.message);
    return [];
  }
};