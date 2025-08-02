export class TokenUtils {
  
  /**
   * Limpia un token de espacios y caracteres especiales
   */
  static cleanToken(token: string): string {
    if (!token) return '';
    
    // Eliminar espacios al inicio y final
    let cleanedToken = token.trim();
    
    // Decodificar URL si es necesario
    try {
      cleanedToken = decodeURIComponent(cleanedToken);
    } catch (e) {
      console.warn('Error decodificando token:', e);
    }
    
    // Eliminar caracteres de nueva línea, tabulaciones y espacios extra
    cleanedToken = cleanedToken.replace(/[\n\r\t]/g, '');
    
    // Eliminar espacios múltiples
    cleanedToken = cleanedToken.replace(/\s+/g, '');
    
    return cleanedToken;
  }
  
  /**
   * Valida si un token tiene el formato correcto
   */
  static isValidToken(token: string): boolean {
    if (!token || token.length === 0) return false;
    
    // Verificar que no tenga espacios
    if (token.includes(' ')) return false;
    
    // Verificar que tenga una longitud mínima (ajustar según tu backend)
    if (token.length < 10) return false;
    
    return true;
  }
  
  /**
   * Obtiene información de debug del token
   */
  static getTokenDebugInfo(token: string): any {
    return {
      original: token,
      cleaned: this.cleanToken(token),
      length: token.length,
      cleanedLength: this.cleanToken(token).length,
      hasSpaces: token.includes(' '),
      isValid: this.isValidToken(this.cleanToken(token))
    };
  }
} 