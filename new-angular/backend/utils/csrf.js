const jwt = require('jsonwebtoken');

const getCsrfSecret = () => `${process.env.JWT_SECRET}-csrf`;

const generateCsrfToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      tv: Number(user.tokenVersion || 0),
      type: 'csrf',
    },
    getCsrfSecret(),
    { expiresIn: '2h' }
  );

const verifyCsrfToken = (token, user) => {
  if (!token || !user) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, getCsrfSecret());
    return (
      decoded.type === 'csrf' &&
      decoded.id === user._id.toString() &&
      Number(decoded.tv) === Number(user.tokenVersion || 0)
    );
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
};
