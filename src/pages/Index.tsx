const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="font-display text-5xl md:text-7xl font-bold gradient-text text-glow mb-6">
          Banque de Mot
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
          Votre collection de mots en apesanteur
        </p>
      </div>
    </div>
  );
};

export default Index;
