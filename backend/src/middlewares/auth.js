const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Usamos el encadenamiento opcional (?.) para evitar que explote si req.body no existe
    const token =
        req.headers["authorization"] ||
        req.body?.token ||
        req.query?.token;

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Un token es requerido para la autenticación"
        });
    }

    try {
        // Eliminar 'Bearer ' si está presente
        const tokenClean = token.startsWith('Bearer ')
            ? token.slice(7, token.length)
            : token;

        const decoded = jwt.verify(tokenClean, process.env.JWT_SECRET || 'dazzart');
        req.user = decoded;
        next(); // ¡Importante! No uses 'return next()' dentro de un try/catch de esta forma
    } catch (err) {
        console.error("[AUTH ERROR]:", err.message);
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado"
        });
    }
};

module.exports = verifyToken;