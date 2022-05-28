import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Router } from "@angular/router";
import { BehaviorSubject, Observable  } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FileUploadService } from '../service/file-upload.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  userDetails: any;
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  previews: string[] = [];
  imageInfos?: Observable<any>;
  LoginStatus$ = new BehaviorSubject<boolean>(false);
  constructor(private userService: UserService, private router: Router, private uploadService: FileUploadService) { }


    ngOnInit(): void {

      this.imageInfos = this.uploadService.getFiles();

      this.userService.getUserProfile().subscribe(
        res => {
          this.userService.currentUser = res;
          this.userDetails = this.userService.currentUser;
          this.LoginStatus$.next(true)
        },
        err => { 
          console.log(err);
        }
      );
    }

    selectFiles(event: any): void {
      this.message = [];
      this.progressInfos = [];
      this.selectedFiles = event.target.files;
      this.previews = [];
      if (this.selectedFiles && this.selectedFiles[0]) {
        const numberOfFiles = this.selectedFiles.length;
        for (let i = 0; i < numberOfFiles; i++) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            console.log(e.target.result);
            this.previews.push(e.target.result);
          };
          reader.readAsDataURL(this.selectedFiles[i]);
        }
      }
    }

    uploadFiles(): void {
      this.message = [];
      if (this.selectedFiles) {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          this.upload(i, this.selectedFiles[i]);
        }
      }
    }

    upload(idx: number, file: File): void {
      this.progressInfos[idx] = { value: 0, fileName: file.name };
      if (file) {
        this.uploadService.upload(file).subscribe(
          (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              const msg = 'Uploaded the file successfully: ' + file.name;
              this.message.push(msg);
              this.imageInfos = this.uploadService.getFiles();
            }
          },
          (err: any) => {
            this.progressInfos[idx].value = 0;
            const msg = 'Could not upload the file: ' + file.name;
            this.message.push(msg);
          });
      }
    }
  
    onLogout(){
      this.userService.deleteToken();
      this.router.navigate(['/login']);
    }


}
