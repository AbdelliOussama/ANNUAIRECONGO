import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectorService, SectorIntelligenceReport } from '../../../core/services/sector.service';
import { Sector } from '../../../core/models/company.model';

@Component({
  selector: 'ac-rapport-ia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- Detailed Report Modal Overlay (Placed at the very top for absolute stacking safety) -->
    @if (selectedReport(); as report) {
      <div class="modal-overlay" (click)="selectedReport.set(null)">
        <div class="modal-container p-8" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
              <div class="icon-bubble-lg">
                <span class="material-symbols-outlined text-3xl">{{ report.icon || 'analytics' }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="badge-category">{{ report.sectorName }}</span>
                  <span class="badge badge-ai-pill">Rapport Groq IA</span>
                </div>
                <h2 class="text-2xl font-bold font-headline text-foreground mt-1">{{ report.title }}</h2>
              </div>
            </div>
            <button (click)="selectedReport.set(null)" class="btn-close flex items-center justify-center" type="button" aria-label="Fermer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="report-metadata-grid grid grid-cols-3 gap-4 mb-6 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div>
              <span class="text-xs text-secondary font-bold block uppercase tracking-wider">Date</span>
              <span class="text-sm font-black text-foreground">{{ report.date }}</span>
            </div>
            <div>
              <span class="text-xs text-secondary font-bold block uppercase tracking-wider">Source</span>
              <span class="text-sm font-black text-foreground">Annuaire Congo</span>
            </div>
            <div>
              <span class="text-xs text-secondary font-bold block uppercase tracking-wider">Statut</span>
              <span class="text-sm font-bold text-success flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span>Analysé</span>
              </span>
            </div>
          </div>

          <div class="modal-body overflow-y-auto max-h-[50vh] pr-4 markdown-body text-left" [innerHTML]="formatMarkdown(report.content)">
          </div>

          <div class="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
            <button (click)="selectedReport.set(null)" class="btn btn-outline py-2 px-6" type="button">Fermer</button>
            <button (click)="printReport()" class="btn btn-primary flex items-center gap-2 py-2.5 px-6" type="button">
              <span class="material-symbols-outlined">download</span>
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>
      </div>
    }

    <section class="hero relative overflow-hidden py-24 text-center">
      <div class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <div class="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        <div class="inline-flex items-center gap-2 mb-4 bg-primary/10 text-primary py-2 px-4 rounded-full text-xs font-semibold">
          <span class="material-symbols-outlined text-sm">insights</span>
          <span>Analyses Économiques de Pointe</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Rapports d'intelligence<br />
          <em class="text-primary not-italic bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">sur l'économie congolaise.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Synthèses sectorielles avancées générées à partir des données réelles du registre d'entreprises, 
          analysées en temps réel par notre intelligence artificielle.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto pb-24">
      <!-- AI Generator Control Panel -->
      <div class="glass-panel p-8 mb-16 rounded-3xl relative overflow-hidden ai-glow">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge-ai">Groq Llama-3</span>
              <span class="pulse-dot"></span>
              <span class="text-xs text-primary font-bold">Moteur d'Analyse Actif</span>
            </div>
            <h2 class="text-2xl font-bold font-headline text-foreground">Générer un nouveau rapport d'intelligence</h2>
            <p class="text-secondary text-sm mt-1 max-w-xl">
              Sélectionnez un secteur d'activité. Notre IA va agréger en temps réel les enregistrements, analyser la répartition géographique régionale et rédiger un rapport économique complet.
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <select 
              [value]="selectedSectorId()" 
              (change)="onSectorChange($event)"
              class="select-input"
              [disabled]="isGenerating()">
              @for (s of sectors(); track s.id) {
                <option [value]="s.id">{{ s.name }}</option>
              }
            </select>
            
            <button 
              (click)="generateReport()" 
              class="btn btn-primary flex items-center justify-center gap-2 py-3 px-6 whitespace-nowrap"
              [disabled]="isGenerating() || !selectedSectorId()">
              @if (isGenerating()) {
                <span class="loader-spinner"></span>
                <span>Génération...</span>
              } @else {
                <span class="material-symbols-outlined">psychology</span>
                <span>Générer avec l'IA</span>
              }
            </button>
          </div>
        </div>

        @if (isGenerating()) {
          <div class="mt-8 p-5 bg-surface/50 border border-outline-variant/30 rounded-2xl relative">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary spin-animation">auto_renew</span>
              <span class="text-sm font-semibold text-primary">{{ generationStep() }}</span>
            </div>
            <div class="w-full bg-outline-variant/30 h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-primary h-1.5 rounded-full animate-progress"></div>
            </div>
          </div>
        }

        @if (errorMessage()) {
          <div class="mt-5 p-4 bg-error-container text-on-error-container border border-error/20 rounded-2xl text-sm flex items-center gap-2">
            <span class="material-symbols-outlined">error_outline</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }
      </div>

      <!-- Section Title & Grid -->
      <div class="flex items-center justify-between mb-8 border-b border-outline-variant/20 pb-4">
        <h2 class="text-2xl font-bold font-headline">Rapports d'Intelligence Disponibles</h2>
        <span class="text-sm text-secondary font-semibold">{{ reports().length }} analyses publiées</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (r of reports(); track r.id || r.title) {
          <article class="report-card cursor-pointer flex flex-col" (click)="selectedReport.set(r)">
            <div class="icon-bubble" aria-hidden="true">
              <span class="material-symbols-outlined">{{ r.icon || 'analytics' }}</span>
            </div>
            <div class="flex items-center justify-between mt-4">
              <span class="badge badge-category">{{ r.sectorName }}</span>
              <span class="badge badge-ai-pill">Rapport IA</span>
            </div>
            <h3 class="title mt-3">{{ r.title }}</h3>
            <p class="excerpt mt-2">{{ r.excerpt }}</p>
            <div class="footer-row mt-auto pt-4 border-t border-outline-variant/10">
              <span class="date">{{ r.date }}</span>
              <button 
                type="button" 
                class="btn btn-outline btn-sm flex items-center gap-1 py-1 px-3 text-xs"
                (click)="selectedReport.set(r); $event.stopPropagation()">
                <span>Consulter</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="cta py-20 text-center max-w-4xl mx-auto px-6 border-t border-outline-variant/20">
      <h2 class="text-3xl font-black font-headline mb-4">Accès complet à l'intelligence économique</h2>
      <p class="text-secondary max-w-xl mx-auto mb-8">
        Souscrivez au forfait Premium pour télécharger l'intégralité des analyses, recevoir les notifications par e-mail en temps réel et accéder à nos outils de prédiction.
      </p>
      <a routerLink="/tarifs" class="btn btn-primary py-4 px-10 text-sm inline-flex items-center gap-2">
        <span>Découvrir le forfait Premium</span>
        <span class="material-symbols-outlined text-sm">stars</span>
      </a>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 48px; }

    .glass-panel {
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid var(--color-outline-variant);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04);
    }
    .ai-glow {
      box-shadow: 0 0 35px rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
    }
    .badge-ai {
      background: linear-gradient(135deg, var(--color-primary), #a855f7);
      color: #ffffff;
      font-weight: 800;
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background: var(--color-primary);
      border-radius: 50%;
      animation: pulse 1.6s infinite;
    }
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
      }
    }
    .spin-animation {
      animation: spin 1.8s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .select-input {
      padding: 12px 16px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-outline);
      background: var(--color-surface);
      color: var(--color-on-surface);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      min-width: 240px;
    }
    .select-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .animate-progress {
      width: 0%;
      animation: progress 8s infinite linear;
    }
    @keyframes progress {
      0% { width: 0%; }
      50% { width: 60%; }
      80% { width: 90%; }
      100% { width: 99%; }
    }

    .report-card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 28px;
      transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
    }
    .report-card:hover { 
      transform: translateY(-4px); 
      box-shadow: var(--shadow-editorial);
      border-color: var(--color-primary);
    }
    .icon-bubble {
      width: 48px; height: 48px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .icon-bubble .material-symbols-outlined { font-size: 24px; }
    
    .badge-category {
      background: var(--color-primary-fixed-dim);
      color: var(--color-on-primary-fixed-variant);
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
    }
    .badge-ai-pill {
      background: var(--color-surface-container-high);
      color: var(--color-primary);
      border: 1px solid var(--color-outline-variant);
      font-weight: 700;
      padding: 3px 8px;
      font-size: 10px;
      border-radius: var(--radius-sm);
    }
    
    .title {
      font-family: var(--font-headline);
      font-size: 18px;
      font-weight: 800;
      color: var(--color-on-surface);
      line-height: 1.4;
    }
    .excerpt { 
      color: var(--color-on-surface-variant); 
      font-size: 14px; 
      line-height: 1.6; 
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .footer-row {
      display: flex; align-items: center; justify-content: space-between;
    }
    .date { color: var(--color-outline); font-size: 12px; font-weight: 600; }

    /* Modal Overlay & Container - Upgraded for absolute layout stacking and z-index safety */
    .modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(12px) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 24px !important;
    }
    .modal-container {
      background: var(--color-surface) !important;
      border: 1px solid var(--color-outline-variant) !important;
      border-radius: var(--radius-3xl) !important;
      max-width: 800px !important;
      width: 100% !important;
      box-shadow: var(--shadow-editorial) !important;
      z-index: 1000000 !important;
      position: relative !important;
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    @keyframes slideUp {
      from { transform: translateY(24px) !important; opacity: 0 !important; }
      to { transform: translateY(0) !important; opacity: 1 !important; }
    }
    .icon-bubble-lg {
      width: 60px; height: 60px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-xl);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .btn-close {
      width: 36px; height: 36px;
      border-radius: 50%;
      color: var(--color-outline);
      transition: background 0.2s, color 0.2s;
    }
    .btn-close:hover {
      background: var(--color-surface-container-high);
      color: var(--color-on-surface);
    }

    /* Spinner Loader */
    .loader-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }
  `],
})
export class RapportIaComponent implements OnInit {
  private readonly sectorService = inject(SectorService);

  protected readonly reports = signal<SectorIntelligenceReport[]>([]);
  protected readonly sectors = signal<Sector[]>([]);
  
  protected readonly selectedReport = signal<SectorIntelligenceReport | null>(null);
  protected readonly selectedSectorId = signal<string>('');
  protected readonly isGenerating = signal<boolean>(false);
  protected readonly generationStep = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadReports();
    this.loadSectors();
  }

  loadReports(): void {
    this.sectorService.getSectorReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (err) => {
        console.error('Failed to load reports', err);
        this.errorMessage.set("Impossible de charger les rapports d'intelligence depuis le serveur.");
      }
    });
  }

  loadSectors(): void {
    this.sectorService.getSectors().subscribe({
      next: (data) => {
        this.sectors.set(data);
        if (data.length > 0) {
          this.selectedSectorId.set(data[0].id);
        }
      },
      error: (err) => console.error('Failed to load sectors', err)
    });
  }

  onSectorChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSectorId.set(value);
  }

  generateReport(): void {
    const sectorId = this.selectedSectorId();
    if (!sectorId) return;

    this.isGenerating.set(true);
    this.errorMessage.set('');
    
    // Smooth loader message sequence
    this.generationStep.set("Agrégation des données d'enregistrement de l'annuaire...");
    
    const step2 = setTimeout(() => {
      if (this.isGenerating()) {
        this.generationStep.set("Analyse sectorielle de répartition géographique régionale...");
      }
    }, 2500);
    
    const step3 = setTimeout(() => {
      if (this.isGenerating()) {
        this.generationStep.set("Rédaction de l'analyse économique par le modèle Groq Llama-3...");
      }
    }, 5000);

    this.sectorService.generateSectorReport(sectorId).subscribe({
      next: (newReport) => {
        this.reports.update(current => [newReport, ...current]);
        this.selectedReport.set(newReport);
        this.isGenerating.set(false);
        clearTimeout(step2);
        clearTimeout(step3);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set("Une erreur est survenue lors de la génération. Veuillez vérifier que le serveur backend est actif avec la clé Groq.");
        this.isGenerating.set(false);
        clearTimeout(step2);
        clearTimeout(step3);
      }
    });
  }

  formatMarkdown(content: string): string {
    if (!content) return '';
    try {
      let html = String(content);
      // Replace markdown headings ###
      html = html.replace(/### (.*?)\n/g, '<h3 class="text-lg font-black mt-6 mb-2 text-primary font-headline">$1</h3>');
      // Replace markdown headings ####
      html = html.replace(/#### (.*?)\n/g, '<h4 class="text-md font-bold mt-4 mb-1 text-secondary font-headline">$1</h4>');
      // Bold tags **
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-foreground">$1</strong>');
      // Bullet lists -
      html = html.replace(/- (.*?)\n/g, '<li class="ml-4 list-disc pl-1 mb-1.5 text-secondary text-sm">$1</li>');
      // Double newlines into paragraphs
      html = html.replace(/\n\n/g, '</p><p class="my-3 text-secondary text-sm leading-relaxed">');
      return `<p class="text-secondary text-sm leading-relaxed">${html}</p>`;
    } catch (e) {
      console.error('Error formatting markdown', e);
      return content;
    }
  }

  printReport(): void {
    window.print();
  }
}
