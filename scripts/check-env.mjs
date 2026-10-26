import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
const groups = {
  core:['NEXT_PUBLIC_APP_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','TURNSTILE_ALLOWED_HOSTNAMES'],
  images:['R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_NAME'],
  email:['RESEND_API_KEY','RESEND_FROM_EMAIL'],
  phone:['TWOFACTOR_API_KEY'],
  analytics:['NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN','NEXT_PUBLIC_POSTHOG_HOST'],
  monitoring:['BETTER_STACK_INGESTING_HOST','BETTER_STACK_SOURCE_TOKEN'],
  billing:['CASHFREE_ENV','CASHFREE_CLIENT_ID','CASHFREE_CLIENT_SECRET','CASHFREE_PLAN_ID','CASHFREE_PLAN_AMOUNT'],
};
let missing=false;
for(const [name,keys] of Object.entries(groups)) {
  const absent=keys.filter(k=>!process.env[k]?.trim());
  if(absent.length) missing=true;
  console.log(name+': '+(absent.length?'missing '+absent.join(', '):'configured'));
}
for(const [key,value] of Object.entries(process.env)) {
  if(key.startsWith('NEXT_PUBLIC_') && /SECRET|PRIVATE|PASSWORD|ACCESS_KEY/.test(key) && value) throw new Error('Secret must not be public: '+key);
}
if(process.argv.includes('--production')) {
  if(!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {console.error('Production app URL must use HTTPS');missing=true;}
  if(process.env.CASHFREE_ENV!=='production') {console.error('Cashfree remains in sandbox');missing=true;}
  process.exitCode=missing?1:0;
}
