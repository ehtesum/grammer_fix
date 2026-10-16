const DICTIONARY_STORAGE_KEY = 'writewise_custom_dictionary_v1';

export class DictionaryStore {
  public static getWords(): string[] {
    try {
      const raw = localStorage.getItem(DICTIONARY_STORAGE_KEY);
      if (!raw) return ['WriteWise', 'Ehtesum'];
      return JSON.parse(raw);
    } catch {
      return ['WriteWise', 'Ehtesum'];
    }
  }

  public static addWord(word: string): string[] {
    const words = this.getWords();
    const cleanWord = word.trim();
    if (cleanWord && !words.includes(cleanWord)) {
      words.push(cleanWord);
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(words));
    }
    return words;
  }

  public static removeWord(word: string): string[] {
    let words = this.getWords();
    words = words.filter(w => w.toLowerCase() !== word.toLowerCase());
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(words));
    return words;
  }
}
