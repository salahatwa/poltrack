import { TestBed } from '@angular/core/testing';
import { EffectsMetadata, getEffectsMetadata } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';

import { cold } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import { SettingsEffects } from './settings.effects';

import { AnimationsService, LocalStorageService } from '@app/core';
import {
  SETTINGS_KEY,
  SettingsActionTypes
} from '@app/settings/settings.reducer';

describe('SettingsEffects', () => {
  let actions$: Observable<Action>;
  let effects: SettingsEffects;
  let metadata: EffectsMetadata<SettingsEffects>;
  let localStorageService: any;
  let animationsService: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        provideMockActions(() => actions$),
        {
          provide: LocalStorageService,
          useValue: jasmine.createSpyObj('LocalStorageService', ['setItem'])
        },
        {
          provide: AnimationsService,
          useValue: jasmine.createSpyObj('AnimationsService', [
            'updateRouteAnimationType'
          ])
        }
      ]
    });

    localStorageService = TestBed.get(LocalStorageService);
    animationsService = TestBed.get(AnimationsService);
    effects = TestBed.get(SettingsEffects);
  });

  it('should not dispatch any action', () => {
    metadata = getEffectsMetadata(effects);
    expect(metadata.persistSettings).toEqual({ dispatch: false });
  });

  it('should call methods on AnimationsService and LocalStorageService for PERSIST action', () => {
    const action = {
      type: SettingsActionTypes.PERSIST,
      payload: {
        settings: {
          pageAnimations: true,
          elementsAnimations: true
        }
      }
    };

    actions$ = cold('a', { a: action });
    effects.persistSettings().subscribe(() => {
      expect(localStorageService.setItem).toHaveBeenCalledWith(
        SETTINGS_KEY,
        action.payload.settings
      );
      expect(animationsService.updateRouteAnimationType).toHaveBeenCalledWith(
        true,
        true
      );
    });
  });

  it('should not call methods on AnimationsService and LocalStorageService for other actions', () => {
    const action = {
      type: SettingsActionTypes.CHANGE_THEME
    };

    actions$ = cold('a-|', { a: action });
    effects.persistSettings().subscribe(undefined, undefined, () => {
      expect(localStorageService.setItem).not.toHaveBeenCalled();
      expect(animationsService.updateRouteAnimationType).not.toHaveBeenCalled();
    });
  });
});
