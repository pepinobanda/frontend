import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@app/pages/auth/auth.service';
import { UsersService } from '@app/pages/admin/services/users.service';
import { Rol } from '@app/shared/models/rol.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
enum Action{
  EDIT = "edit",
  NEW = "new"
}

@Component({
  selector: 'app-modal-formulario',
  templateUrl: './modal-formulario.component.html',
  styleUrls: ['./modal-formulario.component.scss']
})
export class ModalFormularioComponent implements OnInit, OnDestroy {

  // Variables
  actionTODO = Action.NEW;

  
  private destroy$ = new Subject<any>();
  roles: Rol[] = [];

  userForm = this.fb.group({
    cveCliente : [''],
    nombre : ['', [Validators.required]],
    apellidos : ['', [Validators.required]],
    tipoCliente : ['', [Validators.required]],
    cveRegistro : [this.authSvc.userValue?.cveUsuario]
  })

  constructor(public dialogRef: MatDialogRef<ModalFormularioComponent> ,@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private UsersSvc: UsersService, private _snackBar: MatSnackBar, private authSvc: AuthService) { }

  ngOnInit(): void {
    this.getRoles();

    if(this.data?.user.hasOwnProperty("cveCliente")){
      this.actionTODO = Action.EDIT;
      this.data.title = "Editar cliente"
      this.editar()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete()
  }

  private getRoles(): void {
    this.UsersSvc.getRol()
    .pipe(takeUntil(this.destroy$))
    .subscribe(roles => this.roles = roles)
  }

  onSave(): void
  {
    if(this.userForm.invalid){
      return;
    const formValue = this.userForm.value;

    console.log(formValue)
    }
    const formValue = this.userForm.value;
    if(this.actionTODO == Action.NEW) {
      const {cveCliente, ...rest} = formValue;
      this.UsersSvc.new(rest)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this._snackBar.open(result.message, '', {
          duration: 6000
        });
        this.dialogRef.close(true);
      });
    }else{
      // Actualizar
      const {cveRegistro, ...rest} = formValue;
      this.UsersSvc.update(rest)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this._snackBar.open(result.message, '', {
          duration: 6000
        });
        this.dialogRef.close(true);
      });
    }
  }

  private editar(): void{
    this.userForm.patchValue({
      cveCliente : this.data?.user.cveCliente,
      nombre : this.data?.user.nombre,
      apellidos : this.data?.user.apellidos,
      tipoCliente : this.data?.user.tipoCliente,
      cveRegistro : this.data?.user.cveRegistro
    });
  }

  getErrorMessage(field: string): string{
    let message = "";

    const element = this.userForm.get(field);

    if(element?.errors){
      const messages: any = {
        required : "Este campo es requerido",
        email : "El formato no es correcto",
        minLength : "Los caracteres minimos son 4"
      };

      const errorKey = Object.keys(element?.errors).find(Boolean);
      message = String(messages[String(errorKey)]);
    }

    return message;
  }

}
