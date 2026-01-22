import { config } from './config';
import app from './app';

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});