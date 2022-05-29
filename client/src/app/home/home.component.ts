import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Router } from "@angular/router";
import { BehaviorSubject, Observable  } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FileUploadService } from '../service/file-upload.service';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from 'moment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  moment: any = moment;
  userDetails: any;
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  previews: string[] = [];
  photos: any = [];
  imageInViewModal: any;
  imageInfos?: Observable<any>;
  LoginStatus$ = new BehaviorSubject<boolean>(false);
  submitted: boolean = false;
  deletableId: string = '';
  photoAddForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(30)]),
    description: new FormControl('', [Validators.required]),
    photo: new FormControl('', [Validators.required])
  });

  constructor(private userService: UserService, private router: Router, private uploadService: FileUploadService) { }

    ngOnInit(): void {
      this.getPhotos();

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

    get f() {
      return this.photoAddForm.controls;
    }

    // fetching all photos from databse
    getPhotos (): void {
      this.imageInfos = this.uploadService.getFiles();

      this.imageInfos.subscribe((response) => {
        this.photos = response.data;
      });
    }

    // showing selected files
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
      console.log(this.previews);
    }

    // call upload file function
    uploadFiles(title: string, description: string, userId: string): void {
      this.message = [];
      if (this.selectedFiles) {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          this.upload(i, this.selectedFiles[i], title, description, userId);
        }
      }
    }

    // save file in database
    upload(idx: number, file: File, title: string, description: string, userId: string): void {
      this.progressInfos[idx] = { value: 0, fileName: file.name };
      if (file) {
        this.uploadService.upload(file, title, description, userId).subscribe(
          (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              const msg = 'Uploaded the file successfully: ' + file.name;
              this.message.push(msg);
              
              setTimeout(() => {
                // get all photos
                this.getPhotos();

                // close add photo modal
                document.getElementById('photoAddModalClose')?.click();

                // reset add photo form fields
                this.photoAddForm.reset();
                this.submitted = false;
                this.progressInfos = [];
                this.previews = [];
              }, 500);
              
            }
          },
          (err: any) => {
            this.progressInfos[idx].value = 0;
            const msg = 'Could not upload the file: ' + file.name;
            this.message.push(msg);
          });
      }
    }

    // add photo form submit function
    onSubmit() {

      this.submitted = true;
    
      // stop here if form is invalid
      if (this.photoAddForm.invalid) {
        return;
      }

      this.uploadFiles(this.photoAddForm.value.title, this.photoAddForm.value.description, this.userDetails.id);
    }
  
    // logout user
    onLogout(){
      this.userService.deleteToken();
      this.router.navigate(['/login']);
    }

    // get photo upload time
    dateDiff(date2: any) {
      // get current date
      const date1 = new Date().toISOString();
      const momentDate1 = moment(date1);
      const momentDate2 = moment(date2);
      const diff = momentDate1.diff(momentDate2, 'minutes');
      
      // if photo uploaded more tha hour ago
      if (diff > 60)
      {
        return momentDate1.diff(momentDate2, 'hours') + ' hours ago';
      }

      // if photo uploaded less than minute ago
      if (diff < 1)
      {
        return momentDate1.diff(momentDate2, 'seconds') + ' seconds ago';
      }

      return diff + ' minutes ago';
    }

    // delete photo from database
    deletePhoto(deletableId: string) {
      this.uploadService.delete(deletableId).subscribe((response) => {
        // close delete photo confirm modal
        document.getElementById('deleteConfirmationModalClose')?.click();
        // get all photos
        this.getPhotos();
      });
    }
}
