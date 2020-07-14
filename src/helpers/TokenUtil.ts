import jsonwebtoken from 'jsonwebtoken';

/**
 * @class TokenUtil
 * Handle JWT Token Management
 */
class TokenUtil {
  /**
   * Sign payload and returns JWT
   * @param {Object} payload
   * @param {String} time - Expiry time
   */
  static sign(payload) {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  }

  /**
   * Verifies JWT and returns Payload
   * @param {String} token - JWT
   */
  static verify(token) {
    try {
      return jsonwebtoken.verify(token, process.env.JWT_SECRET);
    } catch (err) { return null; }
  }
}

export default TokenUtil;
