import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@app/pages/auth/auth.service';
import { UserResponse } from '@app/shared/models/user.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from '../services/users.service';
import { ModalFormularioComponent } from './components/modal-formulario/modal-formulario.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<any>();

  displayedColumns: string[] = [
    'nombre',
    'apellidos',
    'tipoCliente',
    'cveRegistro',
    'editar',
    'eliminar'
  ];
  lstUsers: UserResponse[] = [];

  constructor(private userSvc: UsersService, private dialog: MatDialog, private _snackBar: MatSnackBar, public authSvc: AuthService) { }

  ngOnInit(): void {
    this.listUsers();
  }

  private listUsers(): void{
    this.userSvc.lista()
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.lstUsers = users);
  }

  onOpenModal(user = {}): void {
    const dialogRef = this.dialog.open(ModalFormularioComponent, {
      disableClose: true,
      data: {title: 'Nuevo cliente', user}
    });

    dialogRef.beforeClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if(result){
        this.listUsers();
      }
    });
  }

  onDelete(cveCliente: number){
    this.userSvc.delete(cveCliente)
    .pipe(takeUntil(this.destroy$))
    .subscribe(result =>{
      if(result){
        this._snackBar.open(result.message, '', {
          duration: 6000
        });
        this.listUsers();
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();
  }

}
