'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Card from '../../components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('ana.silva@hubpowerponto.com.br');
  const [password, setPassword] = useState('hub123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authenticating
    setTimeout(() => {
      if (email && password) {
        setIsLoading(false);
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        setError('Preencha os campos de login para continuar.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-background via-card to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg mb-4">
            <Power className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hub Power &amp; Ponto</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Gestão e Automação Operacional Comercial de Ponta a Ponta
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8 border border-border/80 shadow-xl bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Área Restrita</h2>
              <p className="text-xs text-muted-foreground">Use as credenciais abaixo para testar o MVP.</p>
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger font-medium flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <Input
              label="E-mail Operacional"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.nome@hubpowerponto.com"
              required
            />

            <div className="relative">
              <Input
                label="Senha de Acesso"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Entrar no Painel
            </Button>
          </form>
        </Card>

        {/* Guest Credentials Indicator */}
        <div className="p-4 bg-muted/30 border border-border/50 rounded-xl text-center flex items-center justify-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <div className="text-left text-[11px] text-muted-foreground">
            <span className="font-semibold block text-foreground">Credenciais Mockadas de Teste:</span>
            Email: <code className="text-primary select-all">ana.silva@hubpowerponto.com.br</code>
            <br />
            Senha: <code className="text-primary select-all">hub123456</code>
          </div>
        </div>
      </div>
    </div>
  );
}
